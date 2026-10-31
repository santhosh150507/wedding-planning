import os
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse, PlainTextResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.proposal_contract import SigningToken
from app.services.reports_service import ReportsService
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter(prefix="/reports", tags=["Executive Reports & Profitability"])

@router.get("/profitability")
def get_season_profitability(
    season: int = 2026,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ReportsService.get_season_profitability(db, season_year=season)

@router.get("/export/csv")
def export_profitability_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    csv_data = ReportsService.export_csv(db)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Royal_Knot_Profitability_2026.csv"}
    )

@router.get("/export/pdf")
def export_profitability_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pdf_filename = "Royal_Knot_Season_Profitability_Report.pdf"
    pdf_path = os.path.join(settings.UPLOAD_DIR, pdf_filename)
    ReportsService.export_pdf(db, pdf_path)
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=pdf_filename
    )

@router.post("/share-link")
def create_share_link(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    token = ReportsService.create_shareable_report_token(db)
    return {
        "share_link": f"/shared-report/{token.token}",
        "token": token.token,
        "expires_at": token.expires_at.isoformat()
    }

@router.get("/public/shared/{token}")
def get_public_shared_report(token: str, db: Session = Depends(get_db)):
    st = db.query(SigningToken).filter(
        SigningToken.token == token,
        SigningToken.is_revoked == False,
        SigningToken.target_type == "reports_share"
    ).first()

    if not st:
        raise HTTPException(status_code=404, detail="Invalid share token")

    from datetime import datetime
    if st.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="This shared financial link has expired.")

    return ReportsService.get_season_profitability(db)
