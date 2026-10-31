import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, Base, engine
from app.models.enquiry import Enquiry
from app.models.user import User, Role
from app.core.security import create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_public_enquiry_submission():
    payload = {
        "bride_name": "Meera Kapoor",
        "groom_name": "Arjun Singhal",
        "email": "meera.kapoor@example.com",
        "phone": "+91 98200 99112",
        "preferred_date": (datetime.utcnow() + timedelta(days=90)).isoformat(),
        "destination": "Udaipur",
        "venue_preference": "Taj Lake Palace",
        "guest_count": 450,
        "function_count": 4,
        "functions_requested": ["Mehendi", "Sangeet", "Wedding", "Reception"],
        "theme_preference": "Royal Water Palace",
        "budget_max": 25000000.0,
        "package_type": "full_service",
        "catering_preferences": "Royal Rajasthani Thali",
        "decor_preferences": "White tuberoses and crystal chandeliers",
        "additional_notes": "Bespoke boat arrival"
    }
    response = client.post("/api/v1/enquiries/public", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "enquiry_number" in data
    assert data["enquiry_number"].startswith("RK-ENQ-")
    assert "message" in data

def test_login_and_auth(db_session):
    # Verify founder login
    response = client.post("/api/v1/auth/login", json={
        "email": "founder@royalknot.in",
        "password": "Royal@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"]["name"] == "Founder / Super Admin"

def test_enquiry_soft_delete(db_session):
    founder = db_session.query(User).filter(User.email == "founder@royalknot.in").first()
    token = create_access_token(subject=founder.id)
    headers = {"Authorization": f"Bearer {token}"}

    import uuid
    test_num = f"RK-ENQ-TEST-{uuid.uuid4().hex[:6]}"
    # Create an enquiry to test soft delete
    enq = Enquiry(
        enquiry_number=test_num,
        bride_name="Test Bride",
        groom_name="Test Groom",
        email="test@softdel.com",
        phone="+91 99999 88888",
        preferred_date=datetime.utcnow() + timedelta(days=60),
        destination="Jaipur",
        guest_count=200,
        budget_max=10000000.0,
        source="Website",
        status="New"
    )
    db_session.add(enq)
    db_session.commit()
    db_session.refresh(enq)

    # Soft delete via API
    del_resp = client.delete(f"/api/v1/enquiries/{enq.id}", headers=headers)
    assert del_resp.status_code == 200

    # Ensure it is NOT in list query
    list_resp = client.get("/api/v1/enquiries", headers=headers)
    assert list_resp.status_code == 200
    enq_numbers = [e["enquiry_number"] for e in list_resp.json()]
    assert test_num not in enq_numbers

    # Verify directly in DB that record is NOT deleted, only marked is_deleted=True
    db_session.expire_all()
    db_record = db_session.query(Enquiry).filter(Enquiry.id == enq.id).first()
    assert db_record is not None
    assert db_record.is_deleted is True

def test_add_internal_note(db_session):
    planner = db_session.query(User).filter(User.email == "planner@royalknot.in").first()
    token = create_access_token(subject=planner.id)
    headers = {"Authorization": f"Bearer {token}"}

    enquiries = client.get("/api/v1/enquiries", headers=headers).json()
    assert len(enquiries) > 0
    enq_id = enquiries[0]["id"]

    note_resp = client.post(
        f"/api/v1/enquiries/{enq_id}/notes",
        json={"content": "Automated pytest verification note."},
        headers=headers
    )
    assert note_resp.status_code == 200
    note_data = note_resp.json()
    assert note_data["content"] == "Automated pytest verification note."
    assert note_data["author_name"] == planner.full_name
