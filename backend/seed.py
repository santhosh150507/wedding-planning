from datetime import datetime, timedelta
import uuid
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import Role, User
from app.models.enquiry import Enquiry, EnquiryNote, Consultation
from app.models.proposal_contract import Proposal, Contract, SigningToken
from app.models.wedding import Wedding, WeddingEvent
from app.models.vendor import (
    VendorCategory,
    Vendor,
    QuotationRequest,
    VendorQuotation,
    QuotationLineItem,
    WeddingVendor
)
from app.models.finance import (
    ClientPayment,
    ClientPaymentMilestone,
    VendorInvoice,
    VendorPayment,
    Expense,
    ExtraCharge,
    TimeEntry
)
from app.models.task import TaskTemplate, Task
from app.models.guest import Guest
from app.models.activity import ActivityLog
from app.services.task_engine_service import TaskEngineService

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding full database for The Royal Knot...")

    # 1. Seed Roles
    roles_data = [
        {"name": "Founder / Super Admin", "description": "Full unconstrained administrative & financial control", "permissions": ["all"]},
        {"name": "Administrator", "description": "Agency operational administration and user management", "permissions": ["users", "enquiries", "weddings", "vendors", "finance"]},
        {"name": "Wedding Planner", "description": "Lead planner managing weddings, proposals, tasks, vendors and clients", "permissions": ["enquiries", "weddings", "vendors", "tasks", "calendar", "live_ops"]},
        {"name": "Planning Staff", "description": "On-site and execution staff managing tasks, guests, and day-of check-ins", "permissions": ["tasks", "guests", "live_ops"]},
        {"name": "Finance Manager", "description": "Oversees milestone invoices, vendor reconciliation, profit analysis", "permissions": ["finance", "reports", "contracts"]}
    ]

    roles_map = {}
    for r in roles_data:
        role = db.query(Role).filter(Role.name == r["name"]).first()
        if not role:
            role = Role(name=r["name"], description=r["description"], permissions=r["permissions"])
            db.add(role)
            db.commit()
            db.refresh(role)
        roles_map[r["name"]] = role

    # 2. Seed Users
    default_password = get_password_hash("Royal@123")
    users_data = [
        {"email": "founder@royalknot.in", "full_name": "Maharaja Digvijay Singh", "phone": "+91 98290 11001", "role": "Founder / Super Admin", "hourly_cost_rate": 5000.00},
        {"email": "admin@royalknot.in", "full_name": "Rani Devika Shekhawat", "phone": "+91 98290 11002", "role": "Administrator", "hourly_cost_rate": 3000.00},
        {"email": "planner@royalknot.in", "full_name": "Gayatri Rathore", "phone": "+91 98290 11003", "role": "Wedding Planner", "hourly_cost_rate": 2000.00},
        {"email": "staff@royalknot.in", "full_name": "Vikram Singh Bhati", "phone": "+91 98290 11004", "role": "Planning Staff", "hourly_cost_rate": 1000.00},
        {"email": "finance@royalknot.in", "full_name": "Siddharth Mehta", "phone": "+91 98290 11005", "role": "Finance Manager", "hourly_cost_rate": 2500.00}
    ]

    users_map = {}
    for u in users_data:
        user = db.query(User).filter(User.email == u["email"]).first()
        if not user:
            user = User(
                email=u["email"],
                hashed_password=default_password,
                full_name=u["full_name"],
                phone=u["phone"],
                role_id=roles_map[u["role"]].id,
                hourly_cost_rate=u["hourly_cost_rate"],
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        users_map[u["email"]] = user

    planner_id = users_map["planner@royalknot.in"].id
    finance_id = users_map["finance@royalknot.in"].id
    staff_id = users_map["staff@royalknot.in"].id

    # 3. Seed 12 Vendor Categories
    categories_data = [
        ("Catering", "catering", "Royal Rajasthani banquet and global gourmet Khansamas"),
        ("Decoration", "decor", "Palace scenography, mandaps, brass candelabras, shamianas"),
        ("Photography", "photography", "Candid documentary and museum-grade wedding albums"),
        ("Videography", "videography", "Cinematic 4K drone reels and feature films"),
        ("Makeup Artists", "makeup", "Bridal styling, royal hair and traditional draping"),
        ("DJs and Music", "djs_music", "Celebrity DJs, acoustic percussionists, sound architecture"),
        ("Entertainment", "entertainment", "Manganiyar royal folk artists, Sufi ensembles, royal dancers"),
        ("Florists", "florists", "Dutch roses, native tuberoses, and grand floral installations"),
        ("Transportation", "transport", "Vintage Rolls Royces, lake shikaras, airport convoys"),
        ("Venue", "venue", "Palace estates, fort courtyards, and island palaces"),
        ("Lighting", "lighting", "Architectural palace illumination, chandeliers, cold pyros"),
        ("Other Services", "other", "Safa/turban tying maestros, mehendi artists, astrologers")
    ]
    categories_map = {}
    for cat_name, cat_code, cat_desc in categories_data:
        cat = db.query(VendorCategory).filter(VendorCategory.code == cat_code).first()
        if not cat:
            cat = VendorCategory(name=cat_name, code=cat_code, description=cat_desc)
            db.add(cat)
            db.commit()
            db.refresh(cat)
        categories_map[cat_code] = cat

    # 4. Seed 25+ Vendors across all 12 categories
    vendors_raw = [
        # Catering
        ("Royal Mewar Khansamas", "Thakur Ranveer Singh", "catering", "+91 98291 22001", "mewar.khansama@gmail.com", "Udaipur", 4.9, 98.0, 1.2),
        ("Oberoi Grand Palace Catering", "Chef Sanjeev Anand", "catering", "+91 98291 22002", "oberoi.catering@gmail.com", "Udaipur", 4.8, 97.0, 0.5),
        ("Marwari Heritage Banquets", "Gordhan Das Agarwal", "catering", "+91 98291 22003", "marwari.banquets@gmail.com", "Jaipur", 4.7, 95.0, 2.0),
        ("Shreeji Gourmet Live Pavilions", "Nitin Parekh", "catering", "+91 98291 22004", "shreeji.gourmet@gmail.com", "Jaipur", 4.9, 99.0, 0.8),
        # Decoration
        ("Shekhawati Palace Scenography", "Aditya Rathore", "decor", "+91 98291 22005", "shekhawati.decor@gmail.com", "Jaipur", 4.9, 96.0, 3.1),
        ("Udaivilas Floral & Mandap Atelier", "Kavita Chawla", "decor", "+91 98291 22006", "udaivilas.floral@gmail.com", "Udaipur", 4.8, 95.0, 2.5),
        ("Jodhpur Royal Shamiana Works", "Bhairon Singh", "decor", "+91 98291 22007", "jodhpur.shamiana@gmail.com", "Jodhpur", 4.7, 94.0, 4.0),
        # Photography
        ("Stories by Joseph Radhik", "Joseph Radhik Studio", "photography", "+91 98291 22008", "radhik.studio@gmail.com", "Jaipur", 5.0, 99.0, 0.0),
        ("WeddingNama Heritage", "Ankita Asthana", "photography", "+91 98291 22009", "weddingnama@gmail.com", "Udaipur", 4.9, 98.0, 0.5),
        ("House on the Clouds", "Siddharth Sharma", "photography", "+91 98291 22010", "clouds.photo@gmail.com", "Jaipur", 4.8, 97.0, 1.0),
        # Videography
        ("The Wedding Filmer", "Vishal Punjabi Studio", "videography", "+91 98291 22011", "twf.cinematics@gmail.com", "Jaipur", 5.0, 99.0, 0.0),
        ("Royal Reel Productions", "Devendra Joshi", "videography", "+91 98291 22012", "royalreel@gmail.com", "Udaipur", 4.7, 94.0, 1.8),
        # Makeup Artists
        ("Ojas Rajani Bridal Couture", "Ojas Rajani", "makeup", "+91 98291 22013", "ojas.bridal@gmail.com", "Jaipur", 4.9, 96.0, 0.0),
        ("Daniel Bauer Bridal Atelier", "Daniel Bauer", "makeup", "+91 98291 22014", "bauer.atelier@gmail.com", "Udaipur", 4.8, 95.0, 0.0),
        # DJs and Music
        ("DJ Aqeel Private Soundscape", "Aqeel Ali", "djs_music", "+91 98291 22015", "aqeel.weddings@gmail.com", "Jaipur", 4.9, 98.0, 1.0),
        ("Percussionist Jonqui & Band", "Jonqui Sound", "djs_music", "+91 98291 22016", "jonqui.band@gmail.com", "Udaipur", 4.8, 96.0, 2.0),
        # Entertainment
        ("Manganiyar Royal Folk Troupe", "Ustad Anwar Khan", "entertainment", "+91 98291 22017", "manganiyar.troupe@gmail.com", "Jodhpur", 5.0, 100.0, 0.0),
        ("Nizami Bandhu Sufi Ensemble", "Chand Nizami", "entertainment", "+91 98291 22018", "nizami.sufi@gmail.com", "Jaipur", 4.9, 97.0, 0.5),
        # Florists
        ("Dutch Flora Exotics", "Marco Van Der Berg", "florists", "+91 98291 22019", "dutch.flora@gmail.com", "Jaipur", 4.8, 95.0, 3.5),
        ("Jaipur Rose & Tuberose Guild", "Rameshwar Saini", "florists", "+91 98291 22020", "jaipur.rose@gmail.com", "Jaipur", 4.7, 93.0, 2.8),
        # Transportation
        ("Rajputana Vintage Wheels", "Bhanwar Singh Bhati", "transport", "+91 98291 22021", "vintage.wheels@gmail.com", "Jaipur", 4.9, 98.0, 1.0),
        ("Udaipur Lake Pichola Shikaras", "Ratan Lal Manjhi", "transport", "+91 98291 22022", "lake.shikaras@gmail.com", "Udaipur", 4.9, 99.0, 0.0),
        # Venue
        ("Rambagh Palace Estates", "General Manager Desk", "venue", "+91 98291 22023", "rambagh.events@ihcltata.com", "Jaipur", 5.0, 99.0, 0.0),
        ("Jagmandir Island Palace Administration", "HRH Group Desk", "venue", "+91 98291 22024", "jagmandir.events@hrhhotels.com", "Udaipur", 5.0, 99.0, 0.0),
        # Lighting
        ("Architectural Palace Illuminations", "Suhas Kulkarni", "lighting", "+91 98291 22025", "palace.lighting@gmail.com", "Jaipur", 4.8, 96.0, 2.0),
        ("Skyfire Royal Pyrotechnics", "Mahesh Chandra", "lighting", "+91 98291 22026", "skyfire.pyro@gmail.com", "Udaipur", 4.7, 95.0, 1.5),
        # Other Services
        ("Royal Turban & Safa Maestros", "Keshav Singh Rathore", "other", "+91 98291 22027", "royal.safa@gmail.com", "Jaipur", 4.9, 99.0, 0.0)
    ]

    vendors_map = {}
    for b_name, cp, c_code, ph, em, city, rat, ont, var in vendors_raw:
        v = db.query(Vendor).filter(Vendor.business_name == b_name).first()
        if not v:
            v = Vendor(
                business_name=b_name,
                contact_person=cp,
                category_id=categories_map[c_code].id,
                phone=ph,
                email=em,
                city=city,
                rating=rat,
                on_time_percentage=ont,
                bill_variance_percentage=var,
                gst_number=f"08AABC{hash(b_name)%90000 + 10000}Z1",
                is_active=True
            )
            db.add(v)
            db.commit()
            db.refresh(v)
        vendors_map[b_name] = v

    # 5. Seed Enquiries
    now = datetime.utcnow()
    TaskEngineService.ensure_default_templates(db)

    # 6. Seed 5 Weddings in Different Stages
    weddings_seed_data = [
        # Wedding 1: Active with Catering RFQ Ready to Compare
        {
            "wedding_number": "RK-WED-2026-001",
            "couple_title": "Aditi & Kabir",
            "bride_name": "Aditi Roy Kapoor",
            "groom_name": "Kabir Mathur",
            "contact_email": "kabir.mathur@kapoorstudios.com",
            "contact_phone": "+91 98200 99887",
            "wedding_date_start": now + timedelta(days=45),
            "wedding_date_end": now + timedelta(days=47),
            "destination": "Udaipur",
            "venue_name": "Fateh Garh & Jagmandir Island Palace",
            "expected_guest_count": 420,
            "package_type": "full_service",
            "agreed_budget": 28000000.00,
            "status": "Active"
        },
        # Wedding 2: Completed, highly profitable
        {
            "wedding_number": "RK-WED-2026-002",
            "couple_title": "Devika & Yuvraj",
            "bride_name": "Devika Shekhawat",
            "groom_name": "Yuvraj Singh Ranawat",
            "contact_email": "devika.yuvraj@gmail.com",
            "contact_phone": "+91 98290 44332",
            "wedding_date_start": now - timedelta(days=30),
            "wedding_date_end": now - timedelta(days=28),
            "destination": "Jaipur",
            "venue_name": "Rambagh Palace & Jaigarh",
            "expected_guest_count": 500,
            "package_type": "full_service",
            "agreed_budget": 35000000.00,
            "status": "Completed"
        },
        # Wedding 3: Completed, loss-making (unexpected overruns)
        {
            "wedding_number": "RK-WED-2026-003",
            "couple_title": "Sunaina & Harsh",
            "bride_name": "Sunaina Singhi",
            "groom_name": "Harsh Poddar",
            "contact_email": "sunaina.singhi@gmail.com",
            "contact_phone": "+91 98201 11223",
            "wedding_date_start": now - timedelta(days=15),
            "wedding_date_end": now - timedelta(days=13),
            "destination": "Jaipur",
            "venue_name": "Fairmont Jaipur",
            "expected_guest_count": 400,
            "package_type": "full_service",
            "agreed_budget": 20000000.00,
            "status": "Completed"
        },
        # Wedding 4: Planning
        {
            "wedding_number": "RK-WED-2026-004",
            "couple_title": "Meenakshi & Jaideep",
            "bride_name": "Meenakshi Somani",
            "groom_name": "Jaideep Bangur",
            "contact_email": "meenakshi.somani@gmail.com",
            "contact_phone": "+91 98290 55667",
            "wedding_date_start": now + timedelta(days=90),
            "wedding_date_end": now + timedelta(days=92),
            "destination": "Jaipur",
            "venue_name": "Samode Palace",
            "expected_guest_count": 350,
            "package_type": "full_service",
            "agreed_budget": 22000000.00,
            "status": "Planning"
        },
        # Wedding 5: In Progress
        {
            "wedding_number": "RK-WED-2026-005",
            "couple_title": "Kavya & Prateek",
            "bride_name": "Kavya Agarwal",
            "groom_name": "Prateek Maheshwari",
            "contact_email": "kavya.prateek@gmail.com",
            "contact_phone": "+91 98290 77889",
            "wedding_date_start": now + timedelta(days=5),
            "wedding_date_end": now + timedelta(days=7),
            "destination": "Jodhpur",
            "venue_name": "Umaid Bhawan Palace",
            "expected_guest_count": 450,
            "package_type": "full_service",
            "agreed_budget": 32000000.00,
            "status": "In Progress"
        }
    ]

    weddings_map = {}
    for wd in weddings_seed_data:
        w = db.query(Wedding).filter(Wedding.wedding_number == wd["wedding_number"]).first()
        if not w:
            w = Wedding(
                wedding_number=wd["wedding_number"],
                couple_title=wd["couple_title"],
                bride_name=wd["bride_name"],
                groom_name=wd["groom_name"],
                primary_contact_name=wd["groom_name"],
                contact_email=wd["contact_email"],
                contact_phone=wd["contact_phone"],
                wedding_date_start=wd["wedding_date_start"],
                wedding_date_end=wd["wedding_date_end"],
                destination=wd["destination"],
                venue_name=wd["venue_name"],
                expected_guest_count=wd["expected_guest_count"],
                package_type=wd["package_type"],
                agreed_budget=wd["agreed_budget"],
                assigned_planner_id=planner_id,
                status=wd["status"]
            )
            db.add(w)
            db.commit()
            db.refresh(w)
        # Always ensure instant plan tasks are generated
        TaskEngineService.generate_instant_plan(db, w.id, planner_id)
        weddings_map[wd["wedding_number"]] = w

    w1 = weddings_map["RK-WED-2026-001"] # Aditi & Kabir
    w2 = weddings_map["RK-WED-2026-002"] # Devika & Yuvraj (Completed, Profit)
    w3 = weddings_map["RK-WED-2026-003"] # Sunaina & Harsh (Completed, Loss)

    # 7. Seed Contract with Signed Status for Aditi & Kabir
    cnt1 = db.query(Contract).filter(Contract.wedding_id == w1.id).first()
    if not cnt1:
        cnt1 = Contract(
            enquiry_id="seed-enquiry-aditi",
            wedding_id=w1.id,
            contract_number="RK-CNT-2026-0001",
            package_type="full_service",
            total_amount=28000000.00,
            terms_content="The Royal Knot Luxury Wedding Management Agreement for Aditi & Kabir.",
            status="Signed",
            signed_at=now - timedelta(days=20),
            signed_by_name="Kabir Mathur",
            signer_ip="182.72.14.92",
            pdf_url="/uploads/Contract_RK-CNT-2026-0001.pdf"
        )
        db.add(cnt1)
        db.commit()

    # 8. Seed Catering Quotation Request (RFQ) with THREE Caterers for Aditi & Kabir
    rfq = db.query(QuotationRequest).filter(QuotationRequest.wedding_id == w1.id).first()
    if not rfq:
        rfq = QuotationRequest(
            wedding_id=w1.id,
            category_id=categories_map["catering"].id,
            title="Royal Banqueting & Khansama Gastronomy (420 Guests)",
            specifications="Curate 4 function feasts: Poolside Haldi brunch, Sangeet live counters, Vedic Vivah royal thali, and European Imperial Reception dinner.",
            status="Open"
        )
        db.add(rfq)
        db.commit()
        db.refresh(rfq)

        # Quote 1: Royal Mewar Khansamas (Competitive & High Quality)
        v1 = vendors_map["Royal Mewar Khansamas"]
        q1 = VendorQuotation(
            quotation_request_id=rfq.id,
            vendor_id=v1.id,
            total_amount=1890000.00, # 4500 x 420
            price_per_plate=4500.00,
            extra_hour_rate=25000.00,
            taxes=94500.00,
            inclusions="4-Course Royal Mewari Thali\nLive Pan-Asian Wok Station\nHeritage Dessert Tasting Bar\nSilver Cutlery & Royal Service Staff",
            exclusions="Imported Caviar Bar\nExotic French Truffle Station",
            notes="Ready to mobilize 60 khansamas and master royal thali brass platters.",
            status="Submitted"
        )
        db.add(q1)
        db.commit()
        db.refresh(q1)
        db.add_all([
            QuotationLineItem(vendor_quotation_id=q1.id, item_name="Mewari Royal Thali Experience", quantity=420, unit_rate=2800.00, total_price=1176000.00, is_inclusion=True),
            QuotationLineItem(vendor_quotation_id=q1.id, item_name="Pan-Asian Live Pavilion", quantity=420, unit_rate=1200.00, total_price=504000.00, is_inclusion=True),
            QuotationLineItem(vendor_quotation_id=q1.id, item_name="Dessert & Mithai Bar", quantity=420, unit_rate=500.00, total_price=210000.00, is_inclusion=True)
        ])

        # Quote 2: Oberoi Grand Palace Catering (Premium, Full Inclusions, Higher Price)
        v2 = vendors_map["Oberoi Grand Palace Catering"]
        q2 = VendorQuotation(
            quotation_request_id=rfq.id,
            vendor_id=v2.id,
            total_amount=2184000.00, # 5200 x 420
            price_per_plate=5200.00,
            extra_hour_rate=35000.00,
            taxes=109200.00,
            inclusions="4-Course Royal Mewari Thali\nLive Pan-Asian Wok Station\nHeritage Dessert Tasting Bar\nImported Caviar Bar\nSilver Cutlery & Royal Service Staff",
            exclusions="None. Complete turnkey banquet.",
            notes="Oberoi executive master chef on-site throughout celebration.",
            status="Submitted"
        )
        db.add(q2)
        db.commit()
        db.refresh(q2)
        db.add_all([
            QuotationLineItem(vendor_quotation_id=q2.id, item_name="Grand Palace 5-Star Menu", quantity=420, unit_rate=3500.00, total_price=1470000.00, is_inclusion=True),
            QuotationLineItem(vendor_quotation_id=q2.id, item_name="Caviar & Continental Station", quantity=420, unit_rate=1200.00, total_price=504000.00, is_inclusion=True),
            QuotationLineItem(vendor_quotation_id=q2.id, item_name="Artisanal Patisserie", quantity=420, unit_rate=500.00, total_price=210000.00, is_inclusion=True)
        ])

        # Quote 3: Marwari Heritage Banquets (Lowest Price, Several Exclusions)
        v3 = vendors_map["Marwari Heritage Banquets"]
        q3 = VendorQuotation(
            quotation_request_id=rfq.id,
            vendor_id=v3.id,
            total_amount=1764000.00, # 4200 x 420
            price_per_plate=4200.00,
            extra_hour_rate=20000.00,
            taxes=88200.00,
            inclusions="4-Course Royal Mewari Thali\nHeritage Dessert Tasting Bar",
            exclusions="Live Pan-Asian Wok Station\nImported Caviar Bar\nLate-Night Snack Stalls",
            notes="Traditional pure vegetarian Marwari cuisine only.",
            status="Submitted"
        )
        db.add(q3)
        db.commit()
        db.refresh(q3)
        db.add_all([
            QuotationLineItem(vendor_quotation_id=q3.id, item_name="Authentic Marwari Feast", quantity=420, unit_rate=3500.00, total_price=1470000.00, is_inclusion=True),
            QuotationLineItem(vendor_quotation_id=q3.id, item_name="Halwai Fresh Sweet Counter", quantity=420, unit_rate=700.00, total_price=294000.00, is_inclusion=True)
        ])
        db.commit()

    # 9. Seed Financials for Completed Wedding 2 (Devika & Yuvraj - High Profit)
    if db.query(ClientPayment).filter(ClientPayment.wedding_id == w2.id).count() == 0:
        db.add(ClientPayment(
            wedding_id=w2.id,
            amount=35000000.00,
            payment_date=now - timedelta(days=25),
            payment_method="RTGS Transfer",
            transaction_reference="HDFC-RTGS-WED002-FINAL",
            notes="Full contracted amount settled."
        ))
        # Vendor payments: total ~21000000
        inv1 = VendorInvoice(wedding_id=w2.id, vendor_id=vendors_map["Shekhawati Palace Scenography"].id, invoice_number="INV-SHEKH-01", invoice_date=now - timedelta(days=27), claimed_amount=9500000.00, agreed_baseline_amount=9500000.00, status="Paid")
        inv2 = VendorInvoice(wedding_id=w2.id, vendor_id=vendors_map["Shreeji Gourmet Live Pavilions"].id, invoice_number="INV-SHREEJI-01", invoice_date=now - timedelta(days=27), claimed_amount=8000000.00, agreed_baseline_amount=8000000.00, status="Paid")
        db.add_all([inv1, inv2])
        db.commit()
        db.add_all([
            VendorPayment(wedding_id=w2.id, vendor_invoice_id=inv1.id, vendor_id=inv1.vendor_id, amount=9500000.00, transaction_reference="VPAY-002-1"),
            VendorPayment(wedding_id=w2.id, vendor_invoice_id=inv2.id, vendor_id=inv2.vendor_id, amount=8000000.00, transaction_reference="VPAY-002-2"),
            Expense(wedding_id=w2.id, category="Permissions & Logistics", amount=1200000.00, date=now - timedelta(days=28)),
            TimeEntry(wedding_id=w2.id, user_id=planner_id, hours=120, hourly_rate=2000.00, notes="Master coordination")
        ])
        db.commit()

    # 10. Seed Financials for Completed Wedding 3 (Sunaina & Harsh - Loss Making)
    # Revenue: 20,000,000, but expenses exceeded: 23,500,000 (Loss: -3,500,000)
    if db.query(ClientPayment).filter(ClientPayment.wedding_id == w3.id).count() == 0:
        db.add(ClientPayment(
            wedding_id=w3.id,
            amount=20000000.00,
            payment_date=now - timedelta(days=12),
            payment_method="RTGS Transfer",
            transaction_reference="ICICI-RTGS-WED003-FINAL",
            notes="Contracted budget received."
        ))
        inv3 = VendorInvoice(wedding_id=w3.id, vendor_id=vendors_map["Shekhawati Palace Scenography"].id, invoice_number="INV-SHEKH-LOSS", invoice_date=now - timedelta(days=14), claimed_amount=12000000.00, agreed_baseline_amount=9000000.00, variance_amount=3000000.00, variance_status="Flagged", status="Paid")
        inv4 = VendorInvoice(wedding_id=w3.id, vendor_id=vendors_map["Marwari Heritage Banquets"].id, invoice_number="INV-MARWARI-LOSS", invoice_date=now - timedelta(days=14), claimed_amount=7500000.00, agreed_baseline_amount=6000000.00, variance_amount=1500000.00, variance_status="Flagged", status="Paid")
        db.add_all([inv3, inv4])
        db.commit()
        db.add_all([
            VendorPayment(wedding_id=w3.id, vendor_invoice_id=inv3.id, vendor_id=inv3.vendor_id, amount=12000000.00, transaction_reference="VPAY-003-1"),
            VendorPayment(wedding_id=w3.id, vendor_invoice_id=inv4.id, vendor_id=inv4.vendor_id, amount=7500000.00, transaction_reference="VPAY-003-2"),
            Expense(wedding_id=w3.id, category="Emergency Generators & Rain Shamianas", amount=3500000.00, date=now - timedelta(days=14), notes="Storm required full emergency glass structures"),
            TimeEntry(wedding_id=w3.id, user_id=planner_id, hours=150, hourly_rate=2000.00, notes="Emergency mitigation staff hours"),
            TimeEntry(wedding_id=w3.id, user_id=staff_id, hours=200, hourly_rate=1000.00, notes="24-hour storm response shifts")
        ])
        db.commit()

    print("Phase 2 seed data completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
