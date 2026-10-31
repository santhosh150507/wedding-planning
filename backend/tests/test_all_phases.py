import pytest
import uuid
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.models.wedding import Wedding
from app.models.enquiry import Enquiry
from app.models.vendor import QuotationRequest, VendorQuotation, WeddingVendor
from app.models.task import Task
from app.models.guest import Guest
from app.models.finance import ClientPayment, VendorPayment, VendorInvoice
from app.models.user import User
from app.core.security import create_access_token
from app.services.vendor_rfq_service import VendorRFQService
from app.services.task_engine_service import TaskEngineService
from app.services.live_ops_service import LiveOpsService
from app.services.finance_service import FinanceService
from app.services.reports_service import ReportsService
from app.services.proposal_contract_service import ProposalContractService
from app.services.wedding_service import WeddingService
from app.services.guest_service import GuestService

client = TestClient(app)

@pytest.fixture(scope="function")
def db():
    db = SessionLocal()
    yield db
    db.rollback()
    db.close()

@pytest.fixture(scope="function")
def auth_headers(db):
    planner = db.query(User).filter(User.email == "planner@royalknot.in").first()
    token = create_access_token(subject=planner.id)
    return {"Authorization": f"Bearer {token}"}

# ================= PHASE 2 TESTS =================
def test_contract_proposal_and_mobile_sign(db, auth_headers):
    unique_suffix = uuid.uuid4().hex[:6]
    # 1. Create enquiry
    enq = Enquiry(
        enquiry_number=f"RK-ENQ-TEST-{unique_suffix}",
        bride_name="Pooja Sen",
        groom_name="Rohit Verma",
        email=f"pooja.{unique_suffix}@example.com",
        phone="+91 98200 12345",
        preferred_date=datetime.utcnow() + timedelta(days=120),
        destination="Jaipur",
        guest_count=400,
        budget_max=30000000.0,
        package_type="full_service",
        source="Website",
        status="New"
    )
    db.add(enq)
    db.commit()
    db.refresh(enq)

    # 2. Generate Proposal
    user = db.query(User).first()
    prop = ProposalContractService.create_proposal(
        db=db,
        enquiry_id=enq.id,
        package_type="full_service",
        total_amount=30000000.0,
        pricing_breakdown={"planning_fee": 3000000.0, "vendor_budget": 27000000.0},
        scope_of_work="Turnkey palace wedding execution",
        user_id=user.id
    )
    assert prop.proposal_number.startswith("RK-PROP-")
    assert prop.status == "Draft"

    # 3. Generate Contract
    contract = ProposalContractService.generate_contract(
        db=db,
        enquiry_id=enq.id,
        package_type="full_service",
        total_amount=30000000.0,
        user_id=user.id
    )
    assert contract.contract_number.startswith("RK-CNT-")

    # 4. Generate Signing Token
    st = ProposalContractService.create_signing_token(
        db=db,
        contract_id=contract.id,
        recipient_email=f"pooja.{unique_suffix}@example.com",
        recipient_name="Rohit Verma"
    )
    assert st.token is not None

    # 5. Mobile e-sign using signature canvas data
    signed_contract = ProposalContractService.sign_contract(
        db=db,
        token=st.token,
        signed_by_name="Rohit Verma",
        signature_image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        client_ip="192.168.1.50",
        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
    )
    assert signed_contract.status == "Signed"
    assert signed_contract.signed_by_name == "Rohit Verma"
    assert signed_contract.pdf_url is not None

def test_atomic_rfq_winner_selection(db, auth_headers):
    # Wedding 1 has 3 caterer quotes seeded
    w1 = db.query(Wedding).filter(Wedding.wedding_number == "RK-WED-2026-001").first()
    rfq = db.query(QuotationRequest).filter(QuotationRequest.wedding_id == w1.id).first()
    assert rfq is not None

    # Compare quotations
    comp = VendorRFQService.compare_quotations(db, rfq.id)
    assert len(comp["quotations"]) == 3
    assert comp["lowest_total_estimate"] > 0
    winner_quote_id = comp["recommended_lowest_quote_id"]
    assert winner_quote_id is not None

    # Award quotation in 1 atomic transaction
    user_id = db.query(User).first().id
    wv = VendorRFQService.select_winning_quotation(db, winner_quote_id, user_id)
    assert wv.status == "Confirmed"
    assert wv.rate_card is not None
    assert wv.rate_card["price_per_plate"] is not None

    # Verify other two quotations are marked 'Closed - Not Selected'
    other_quotes = db.query(VendorQuotation).filter(
        VendorQuotation.quotation_request_id == rfq.id,
        VendorQuotation.id != winner_quote_id
    ).all()
    for q in other_quotes:
        assert q.status == "Closed - Not Selected"

    # Verify RFQ is marked 'Awarded'
    db.refresh(rfq)
    assert rfq.status == "Awarded"

def test_convert_enquiry_to_wedding(db, auth_headers):
    unique_suffix = uuid.uuid4().hex[:6]
    enq = Enquiry(
        enquiry_number=f"RK-ENQ-CONV-{unique_suffix}",
        bride_name="Simran Kaur",
        groom_name="Raj Malhotra",
        email=f"simran.{unique_suffix}@example.com",
        phone="+91 98200 55443",
        preferred_date=datetime.utcnow() + timedelta(days=90),
        destination="Udaipur",
        guest_count=350,
        budget_max=22000000.0,
        package_type="full_service",
        source="Website",
        status="Negotiation"
    )
    db.add(enq)
    db.commit()
    db.refresh(enq)

    user_id = db.query(User).first().id
    wedding = WeddingService.convert_enquiry_to_wedding(db, enq.id, user_id)
    assert wedding.wedding_number.startswith("RK-WED-")
    assert wedding.couple_title == "Simran Kaur & Raj Malhotra"
    assert enq.status == "Confirmed"

# ================= PHASE 3 TESTS =================
def test_instant_plan_idempotence(db):
    w1 = db.query(Wedding).filter(Wedding.wedding_number == "RK-WED-2026-001").first()
    user_id = db.query(User).first().id

    TaskEngineService.generate_instant_plan(db, w1.id, user_id)
    initial_tasks = db.query(Task).filter(Task.wedding_id == w1.id).count()
    assert initial_tasks >= 25 # Must have 25+ tasks for full service

    # Rerun instant plan generator (retry test)
    TaskEngineService.generate_instant_plan(db, w1.id, user_id)
    after_retry_tasks = db.query(Task).filter(Task.wedding_id == w1.id).count()

    # Idempotent: must NOT duplicate tasks
    assert after_retry_tasks == initial_tasks

def test_guest_csv_import(db):
    w1 = db.query(Wedding).filter(Wedding.wedding_number == "RK-WED-2026-001").first()
    user_id = db.query(User).first().id
    csv_sample = """full_name,phone,email,category,party_size,rsvp_status,dietary_preference,table_number
Maharaja Gaj Singh,+91 98290 11111,gajsingh@heritage.in,VIP,4,Confirmed,Vegetarian,T-01
Princess Gayatri,+91 98290 22222,gayatri@heritage.in,Bride Family,2,Confirmed,Jain,T-01
Rajkumar Amar,+91 98290 33333,amar@heritage.in,Friend,1,Tentative,Non-Vegetarian,T-05
"""
    result = GuestService.import_guests_csv(db, w1.id, csv_sample, user_id)
    assert result["success"] is True
    assert result["imported_count"] == 3

# ================= PHASE 4 TESTS =================
def test_vendor_late_arrival_detection(db):
    flagged = LiveOpsService.run_minute_late_vendor_check(db)
    assert flagged >= 0

def test_duplicate_vendor_payment_rejection(db):
    w2 = db.query(Wedding).filter(Wedding.wedding_number == "RK-WED-2026-002").first()
    user_id = db.query(User).first().id
    inv = db.query(VendorInvoice).filter(VendorInvoice.wedding_id == w2.id).first()
    assert inv is not None

    with pytest.raises(ValueError) as exc:
        FinanceService.record_vendor_payment(
            db=db,
            wedding_id=w2.id,
            vendor_invoice_id=inv.id,
            amount=1000.0,
            transaction_reference="VPAY-002-1", # Duplicate!
            user_id=user_id
        )
    assert "Duplicate payment reference" in str(exc.value)

def test_overpayment_rejection(db):
    w1 = db.query(Wedding).filter(Wedding.wedding_number == "RK-WED-2026-001").first()
    wv = db.query(WeddingVendor).first()
    vendor_id = wv.vendor_id if wv else db.query(User).first().id
    user_id = db.query(User).first().id

    # Create an invoice of 500,000
    inv = FinanceService.submit_vendor_invoice(
        db=db,
        wedding_id=w1.id,
        vendor_id=vendor_id,
        invoice_number=f"TEST-INV-{uuid.uuid4().hex[:6]}",
        claimed_amount=500000.0,
        agreed_baseline_amount=500000.0
    )

    # Attempt to pay 600,000 (exceeds claimed amount)
    with pytest.raises(ValueError) as exc:
        FinanceService.record_vendor_payment(
            db=db,
            wedding_id=w1.id,
            vendor_invoice_id=inv.id,
            amount=600000.0, # Overpayment!
            transaction_reference=f"TX-OVERPAY-{uuid.uuid4().hex[:6]}",
            user_id=user_id
        )
    assert "exceeds the payable amount" in str(exc.value)

def test_extra_charges_calculated_from_rate_card(db):
    w1 = db.query(Wedding).filter(Wedding.wedding_number == "RK-WED-2026-001").first()
    wv = db.query(WeddingVendor).first()
    user_id = db.query(User).first().id

    extras = FinanceService.calculate_and_add_extra_charges(
        db=db,
        wedding_id=w1.id,
        vendor_id=wv.vendor_id if wv else "test-vendor",
        category="Catering",
        extra_plates=60,
        extra_hours=2.0,
        user_id=user_id
    )
    assert len(extras) == 2
    assert extras[0].total_amount > 0
    assert extras[0].is_billable_to_client is True

# ================= PHASE 5 TESTS =================
def test_season_profitability_and_loss_ranking(db):
    season_data = ReportsService.get_season_profitability(db, 2026)
    assert season_data["total_revenue"] > 0
    assert len(season_data["weddings_ranking"]) >= 5

    w2_rep = next(r for r in season_data["weddings_ranking"] if r["wedding_number"] == "RK-WED-2026-002")
    assert w2_rep["net_profit"] > 0
    assert w2_rep["is_loss_making"] is False

    w3_rep = next(r for r in season_data["weddings_ranking"] if r["wedding_number"] == "RK-WED-2026-003")
    assert w3_rep["net_profit"] < 0
    assert w3_rep["is_loss_making"] is True

    csv_text = ReportsService.export_csv(db)
    assert "RK-WED-2026-002" in csv_text
    assert "LOSS-MAKING" in csv_text
