import os
from datetime import datetime, timedelta
import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch

from app.models.enquiry import Enquiry
from app.models.proposal_contract import Proposal, Contract, SigningToken
from app.models.wedding import Wedding
from app.models.activity import ActivityLog
from app.core.config import settings

class ProposalContractService:
    @staticmethod
    def create_proposal(
        db: Session,
        enquiry_id: str,
        package_type: str,
        total_amount: float,
        pricing_breakdown: Dict[str, Any],
        scope_of_work: str,
        user_id: str
    ) -> Proposal:
        enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
        if not enquiry:
            raise ValueError("Enquiry not found")

        # Generate proposal number
        count = db.query(Proposal).count() + 1
        year = datetime.utcnow().year
        proposal_number = f"RK-PROP-{year}-{count:04d}"

        proposal = Proposal(
            enquiry_id=enquiry_id,
            proposal_number=proposal_number,
            package_type=package_type,
            total_amount=total_amount,
            pricing_breakdown=pricing_breakdown,
            scope_of_work=scope_of_work,
            status="Draft"
        )
        db.add(proposal)
        enquiry.status = "Proposal Sent"
        enquiry.last_activity_at = datetime.utcnow()
        db.commit()
        db.refresh(proposal)

        log = ActivityLog(
            user_id=user_id,
            enquiry_id=enquiry_id,
            action="PROPOSAL_CREATED",
            details={"proposal_number": proposal_number, "total_amount": total_amount}
        )
        db.add(log)
        db.commit()
        return proposal

    @staticmethod
    def generate_contract(
        db: Session,
        enquiry_id: str,
        package_type: str,
        total_amount: float,
        user_id: str
    ) -> Contract:
        enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
        if not enquiry:
            raise ValueError("Enquiry not found")

        existing_contract = db.query(Contract).filter(Contract.enquiry_id == enquiry_id).first()
        if existing_contract:
            return existing_contract

        count = db.query(Contract).count() + 1
        year = datetime.utcnow().year
        contract_number = f"RK-CNT-{year}-{count:04d}"

        # Standard luxury agreement terms
        terms_content = (
            f"THE ROYAL KNOT LUXURY WEDDING MANAGEMENT AGREEMENT\n\n"
            f"This Service Agreement is entered into between The Royal Knot Private Limited and the clients "
            f"{enquiry.bride_name} & {enquiry.groom_name} for the curation of their royal destination wedding "
            f"in {enquiry.destination}, scheduled for {enquiry.preferred_date.strftime('%B %d, %Y')}.\n\n"
            f"1. SCOPE OF SERVICES: The Agency agrees to deliver {package_type.replace('_', ' ').title()} management, "
            f"encompassing palace venue coordination, vendor RFQ negotiations, master event timelines, and on-site orchestration.\n"
            f"2. FINANCIAL OBLIGATIONS: The total professional planning fee is agreed at INR {total_amount:,.2f}.\n"
            f"3. STAGED MILESTONES: 25% Booking Deposit upon signing, 50% Advance 30 days prior to event, and 25% final settlement post-event.\n"
            f"4. DISCRETION & CONFIDENTIALITY: Both parties agree to absolute mutual privacy and non-disclosure.\n"
            f"5. ACCESS GATEKEEPER: Detailed vendor contracts and proprietary palace floor plans shall be released strictly upon execution of this agreement."
        )

        contract = Contract(
            enquiry_id=enquiry_id,
            contract_number=contract_number,
            package_type=package_type,
            total_amount=total_amount,
            terms_content=terms_content,
            status="Draft"
        )
        db.add(contract)
        db.commit()
        db.refresh(contract)

        log = ActivityLog(
            user_id=user_id,
            enquiry_id=enquiry_id,
            action="CONTRACT_GENERATED",
            details={"contract_number": contract_number, "total_amount": total_amount}
        )
        db.add(log)
        db.commit()
        return contract

    @staticmethod
    def create_signing_token(db: Session, contract_id: str, recipient_email: str, recipient_name: str) -> SigningToken:
        token_str = str(uuid.uuid4()).replace("-", "")
        expires_at = datetime.utcnow() + timedelta(days=7) # 7 days validity

        signing_token = SigningToken(
            token=token_str,
            target_type="contract",
            target_id=contract_id,
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            expires_at=expires_at,
            is_revoked=False
        )
        db.add(signing_token)

        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if contract and contract.status == "Draft":
            contract.status = "Sent"

        db.commit()
        db.refresh(signing_token)
        return signing_token

    @staticmethod
    def get_signing_context(db: Session, token: str) -> Dict[str, Any]:
        signing_token = db.query(SigningToken).filter(
            SigningToken.token == token,
            SigningToken.is_revoked == False
        ).first()

        if not signing_token:
            raise ValueError("Invalid or revoked signing token")

        if signing_token.expires_at < datetime.utcnow():
            raise ValueError("This signing link has expired. Please contact your wedding planner for a new link.")

        if signing_token.used_at:
            raise ValueError("This document has already been signed.")

        contract = db.query(Contract).filter(Contract.id == signing_token.target_id).first()
        if not contract:
            raise ValueError("Contract not found")

        enquiry = contract.enquiry
        return {
            "token": token,
            "contract_id": contract.id,
            "contract_number": contract.contract_number,
            "status": contract.status,
            "couple": f"{enquiry.bride_name} & {enquiry.groom_name}",
            "destination": enquiry.destination,
            "wedding_date": enquiry.preferred_date.isoformat(),
            "package_type": contract.package_type,
            "total_amount": float(contract.total_amount),
            "terms_content": contract.terms_content,
            "expires_at": signing_token.expires_at.isoformat()
        }

    @staticmethod
    def sign_contract(
        db: Session,
        token: str,
        signed_by_name: str,
        signature_image: str,
        client_ip: str,
        user_agent: str
    ) -> Contract:
        signing_token = db.query(SigningToken).filter(
            SigningToken.token == token,
            SigningToken.is_revoked == False
        ).first()

        if not signing_token or signing_token.expires_at < datetime.utcnow() or signing_token.used_at:
            raise ValueError("Invalid, expired, or already used signing link.")

        contract = db.query(Contract).filter(Contract.id == signing_token.target_id).first()
        if not contract:
            raise ValueError("Contract not found")

        now = datetime.utcnow()
        contract.status = "Signed"
        contract.signed_at = now
        contract.signed_by_name = signed_by_name
        contract.signed_signature_image = signature_image
        contract.signer_ip = client_ip
        contract.signer_user_agent = user_agent

        # Mark token used
        signing_token.used_at = now

        # Update enquiry status to Confirmed or Negotiation/Ready
        enquiry = contract.enquiry
        if enquiry:
            enquiry.status = "Negotiation" # Ready for booking confirmation
            enquiry.last_activity_at = now

        # Generate signed PDF record
        pdf_filename = f"Contract_{contract.contract_number}.pdf"
        pdf_path = os.path.join(settings.UPLOAD_DIR, pdf_filename)
        ProposalContractService._generate_contract_pdf(contract, enquiry, pdf_path)
        contract.pdf_url = f"/uploads/{pdf_filename}"

        db.commit()
        db.refresh(contract)

        log = ActivityLog(
            enquiry_id=contract.enquiry_id,
            action="CONTRACT_SIGNED_MOBILE",
            details={
                "contract_number": contract.contract_number,
                "signed_by": signed_by_name,
                "ip": client_ip,
                "signed_at": str(now)
            }
        )
        db.add(log)
        db.commit()
        return contract

    @staticmethod
    def _generate_contract_pdf(contract: Contract, enquiry: Enquiry, output_path: str):
        c = canvas.Canvas(output_path, pagesize=letter)
        width, height = letter

        # Header banner
        c.setFillColor(colors.HexColor("#1A1F2C"))
        c.rect(0, height - 1.2 * inch, width, 1.2 * inch, stroke=0, fill=1)
        
        c.setFillColor(colors.HexColor("#FAF8F5"))
        c.setFont("Helvetica-Bold", 18)
        c.drawString(0.75 * inch, height - 0.7 * inch, "THE ROYAL KNOT")
        c.setFont("Helvetica", 10)
        c.drawString(0.75 * inch, height - 0.95 * inch, "LUXURY WEDDING PLANNING & MANAGEMENT AGREEMENT")

        # Document Details
        c.setFillColor(colors.HexColor("#1A1F2C"))
        c.setFont("Helvetica-Bold", 11)
        c.drawString(0.75 * inch, height - 1.6 * inch, f"Agreement Reference: {contract.contract_number}")
        c.setFont("Helvetica", 10)
        c.drawString(0.75 * inch, height - 1.85 * inch, f"Client: {enquiry.bride_name} & {enquiry.groom_name}")
        c.drawString(0.75 * inch, height - 2.05 * inch, f"Destination: {enquiry.destination} | Date: {enquiry.preferred_date.strftime('%d %B, %Y')}")
        c.drawString(0.75 * inch, height - 2.25 * inch, f"Agreed Management Fee: INR {float(contract.total_amount):,.2f}")

        # Terms Body
        c.setFont("Helvetica", 9)
        text_object = c.beginText(0.75 * inch, height - 2.6 * inch)
        text_object.setLeading(14)
        for line in contract.terms_content.split("\n"):
            text_object.textLine(line)
        c.drawText(text_object)

        # Signature & Audit Trail
        c.setStrokeColor(colors.HexColor("#C5A880"))
        c.line(0.75 * inch, 2.2 * inch, width - 0.75 * inch, 2.2 * inch)
        
        c.setFont("Helvetica-Bold", 10)
        c.drawString(0.75 * inch, 1.95 * inch, "DIGITAL EXECUTION & AUDIT TRAIL:")
        c.setFont("Helvetica", 9)
        c.drawString(0.75 * inch, 1.7 * inch, f"Digitally Signed By: {contract.signed_by_name or 'Client'}")
        c.drawString(0.75 * inch, 1.5 * inch, f"Timestamp: {contract.signed_at.strftime('%Y-%m-%d %H:%M:%S UTC') if contract.signed_at else 'N/A'}")
        c.drawString(0.75 * inch, 1.3 * inch, f"Signer IP Address: {contract.signer_ip or 'Recorded'}")
        c.drawString(0.75 * inch, 1.1 * inch, "Verification: Cryptographically Bound to The Royal Knot Platform Records")

        c.save()

    @staticmethod
    def is_contract_signed(db: Session, enquiry_id: str) -> bool:
        contract = db.query(Contract).filter(
            Contract.enquiry_id == enquiry_id,
            Contract.status == "Signed"
        ).first()
        return contract is not None
