from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.user import User
from app.models.proposal_contract import Contract, Proposal
from app.services.proposal_contract_service import ProposalContractService
from app.api.deps import get_current_user

router = APIRouter(prefix="/contracts", tags=["Proposals & Contracts"])

class ProposalCreate(BaseModel):
    enquiry_id: str
    package_type: str = "full_service"
    total_amount: float
    pricing_breakdown: Dict[str, Any] = {}
    scope_of_work: str = ""

class ContractGenerateRequest(BaseModel):
    enquiry_id: str
    package_type: str = "full_service"
    total_amount: float

class SendContractRequest(BaseModel):
    recipient_email: str
    recipient_name: str

class DigitalSignRequest(BaseModel):
    signed_by_name: str
    signature_image: str # Base64 signature data

@router.post("/proposals")
def create_proposal(
    data: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        proposal = ProposalContractService.create_proposal(
            db=db,
            enquiry_id=data.enquiry_id,
            package_type=data.package_type,
            total_amount=data.total_amount,
            pricing_breakdown=data.pricing_breakdown,
            scope_of_work=data.scope_of_work,
            user_id=current_user.id
        )
        return {
            "id": proposal.id,
            "proposal_number": proposal.proposal_number,
            "total_amount": float(proposal.total_amount),
            "status": proposal.status
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/generate")
def generate_contract(
    data: ContractGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        contract = ProposalContractService.generate_contract(
            db=db,
            enquiry_id=data.enquiry_id,
            package_type=data.package_type,
            total_amount=data.total_amount,
            user_id=current_user.id
        )
        return {
            "id": contract.id,
            "contract_number": contract.contract_number,
            "total_amount": float(contract.total_amount),
            "status": contract.status,
            "terms_content": contract.terms_content
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{contract_id}/send")
def send_contract(
    contract_id: str,
    data: SendContractRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    signing_token = ProposalContractService.create_signing_token(
        db=db,
        contract_id=contract_id,
        recipient_email=data.recipient_email,
        recipient_name=data.recipient_name
    )
    return {
        "message": "Expiring digital contract link generated successfully.",
        "signing_link": f"/sign/{signing_token.token}",
        "token": signing_token.token,
        "expires_at": signing_token.expires_at.isoformat()
    }

# Public token signing endpoints (No login required for couples)
@router.get("/public/signing-context/{token}")
def get_public_signing_context(token: str, db: Session = Depends(get_db)):
    try:
        return ProposalContractService.get_signing_context(db, token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/public/sign/{token}")
def execute_public_sign(
    token: str,
    data: DigitalSignRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown Browser")

    try:
        contract = ProposalContractService.sign_contract(
            db=db,
            token=token,
            signed_by_name=data.signed_by_name,
            signature_image=data.signature_image,
            client_ip=client_ip,
            user_agent=user_agent
        )
        return {
            "success": True,
            "message": "Service Agreement signed successfully and cryptographically recorded.",
            "contract_number": contract.contract_number,
            "signed_at": contract.signed_at.isoformat(),
            "pdf_url": contract.pdf_url
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
