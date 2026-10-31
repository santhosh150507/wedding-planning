from datetime import datetime, timedelta
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import Role, User
from app.models.enquiry import Enquiry, EnquiryNote, Consultation
from app.models.wedding import Wedding, WeddingEvent
from app.models.vendor import VendorCategory, Vendor
from app.models.finance import ClientPayment, ClientPaymentMilestone, VendorInvoice, VendorPayment, Expense, TimeEntry
from app.models.task import TaskTemplate, Task
from app.models.activity import ActivityLog

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding The Royal Knot database...")

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
        {
            "email": "founder@royalknot.in",
            "full_name": "Maharaja Digvijay Singh",
            "phone": "+91 98290 11001",
            "role": "Founder / Super Admin",
            "hourly_cost_rate": 5000.00
        },
        {
            "email": "admin@royalknot.in",
            "full_name": "Rani Devika Shekhawat",
            "phone": "+91 98290 11002",
            "role": "Administrator",
            "hourly_cost_rate": 3000.00
        },
        {
            "email": "planner@royalknot.in",
            "full_name": "Gayatri Rathore",
            "phone": "+91 98290 11003",
            "role": "Wedding Planner",
            "hourly_cost_rate": 2000.00
        },
        {
            "email": "staff@royalknot.in",
            "full_name": "Vikram Singh Bhati",
            "phone": "+91 98290 11004",
            "role": "Planning Staff",
            "hourly_cost_rate": 1000.00
        },
        {
            "email": "finance@royalknot.in",
            "full_name": "Siddharth Mehta",
            "phone": "+91 98290 11005",
            "role": "Finance Manager",
            "hourly_cost_rate": 2500.00
        }
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
    admin_id = users_map["admin@royalknot.in"].id

    # 3. Seed Vendor Categories
    categories = [
        ("Catering & Royal Banquet", "catering"),
        ("Palace Decor & Set Design", "decor"),
        ("Photography & Cinematography", "photography"),
        ("Celebrity DJs & Sound Design", "music"),
        ("Bridal Makeup & Styling", "makeup"),
        ("Live Entertainment & Folk Arts", "entertainment"),
        ("Heritage Transportation & Vintage Cars", "transport"),
        ("Heritage Venue Management", "venue"),
        ("Architectural Lighting & Fireworks", "lighting")
    ]
    for cat_name, cat_code in categories:
        if not db.query(VendorCategory).filter(VendorCategory.code == cat_code).first():
            db.add(VendorCategory(name=cat_name, code=cat_code))
    db.commit()

    # 4. Seed Enquiries
    now = datetime.utcnow()
    enquiries_data = [
        {
            "enquiry_number": "RK-ENQ-2026-0001",
            "bride_name": "Ananya Singhania",
            "groom_name": "Rohan Mehra",
            "email": "ananya.singhania@gmail.com",
            "phone": "+91 98111 22334",
            "preferred_date": now + timedelta(days=90),
            "destination": "Udaipur",
            "venue_preference": "Taj Lake Palace & Jagmandir Island",
            "guest_count": 450,
            "function_count": 4,
            "functions_requested": ["Mehendi", "Sangeet", "Wedding", "Royal Reception"],
            "theme_preference": "Mughal & Rajputana Royal Opulence",
            "budget_max": 25000000.00, # 2.5 Crore INR
            "package_type": "full_service",
            "catering_preferences": "Royal Rajasthani Thali, Pan-Asian live counters, Michelin curated dessert bar",
            "decor_preferences": "Thousands of marigolds, antique brass lanterns, mirror work Mandap on water",
            "additional_notes": "Couple requests helicopter entry for the Baraat and private boat transfers.",
            "source": "Website",
            "status": "New",
            "assigned_planner_id": planner_id,
            "last_activity_at": now - timedelta(hours=2)
        },
        {
            "enquiry_number": "RK-ENQ-2026-0002",
            "bride_name": "Priyanka Jhunjhunwala",
            "groom_name": "Aman Goenka",
            "email": "priyanka.j@outlook.com",
            "phone": "+91 98200 44556",
            "preferred_date": now + timedelta(days=120),
            "destination": "Jaipur",
            "venue_preference": "Rambagh Palace & Jaigarh Fort",
            "guest_count": 550,
            "function_count": 5,
            "functions_requested": ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"],
            "theme_preference": "Heritage Pink City & Regal Gold",
            "budget_max": 35000000.00, # 3.5 Crore INR
            "package_type": "full_service",
            "catering_preferences": "Authentic Marwari feast with modern progressive Indian fusion",
            "decor_preferences": "Tuberose chandeliers, royal shamianas, hand-carved floral jali screens",
            "additional_notes": "VIP delegates from London and Dubai attending; private airport chartered convoys needed.",
            "source": "Instagram",
            "status": "Contacted",
            "assigned_planner_id": planner_id,
            "last_activity_at": now - timedelta(days=1)
        },
        {
            "enquiry_number": "RK-ENQ-2026-0003",
            "bride_name": "Divya Chordia",
            "groom_name": "Karan Mittal",
            "email": "divya.chordia@mittalcorp.com",
            "phone": "+91 97170 88990",
            "preferred_date": now + timedelta(days=60),
            "destination": "Udaipur",
            "venue_preference": "The Leela Palace Udaipur",
            "guest_count": 350,
            "function_count": 3,
            "functions_requested": ["Sangeet", "Wedding", "Reception"],
            "theme_preference": "Lakeside Romance & Candlelit Courtyards",
            "budget_max": 18000000.00, # 1.8 Crore INR
            "package_type": "full_service",
            "catering_preferences": "Pure vegetarian Jain gourmet and European Mediterranean live stations",
            "decor_preferences": "Glasshouse Sangeet, thousands of floating candles on Pichola lake",
            "additional_notes": "Awaiting final date lock with the family pandit.",
            "source": "Referral",
            "status": "Consultation Scheduled",
            "assigned_planner_id": planner_id,
            "last_activity_at": now - timedelta(days=2),
            "follow_up_date": now + timedelta(days=1)
        },
        {
            "enquiry_number": "RK-ENQ-2026-0004",
            "bride_name": "Isha Ambawat",
            "groom_name": "Sameer Kothari",
            "email": "isha.ambawat@gmail.com",
            "phone": "+91 99300 77112",
            "preferred_date": now + timedelta(days=150),
            "destination": "Jaipur",
            "venue_preference": "Samode Palace",
            "guest_count": 300,
            "function_count": 4,
            "functions_requested": ["Haldi", "Mehendi", "Sangeet", "Wedding"],
            "theme_preference": "Boho Royal & Sufi Mystique",
            "budget_max": 15000000.00,
            "package_type": "partial_day_of",
            "catering_preferences": "Traditional Rajasthani & Continental buffet",
            "decor_preferences": "Hand-painted frescoes inspiration with pampa grass and marigold installations",
            "additional_notes": "Client requested proposal with Day-of coordination breakdown.",
            "source": "WhatsApp",
            "status": "Proposal Sent",
            "assigned_planner_id": planner_id,
            "last_activity_at": now - timedelta(days=4) # Inactive 3+ days!
        },
        {
            "enquiry_number": "RK-ENQ-2026-0005",
            "bride_name": "Radhika Biyani",
            "groom_name": "Abhishek Dalmia",
            "email": "radhika.b@dalmiagroup.in",
            "phone": "+91 98210 66554",
            "preferred_date": now + timedelta(days=180),
            "destination": "Jaipur",
            "venue_preference": "Fairmont Jaipur",
            "guest_count": 600,
            "function_count": 5,
            "functions_requested": ["Haldi", "Mehendi", "Sangeet", "Wedding", "Grand Gala"],
            "theme_preference": "Grand Imperial Durbar",
            "budget_max": 40000000.00, # 4 Crore INR
            "package_type": "full_service",
            "catering_preferences": "Full gourmet multi-cuisine feast by royal Khansamas",
            "decor_preferences": "Extravagant grand entrance with royal trumpeters and gold zardozi canopies",
            "additional_notes": "Negotiating artist rider charges and final payment milestone schedule.",
            "source": "Call",
            "status": "Negotiation",
            "assigned_planner_id": planner_id,
            "last_activity_at": now - timedelta(hours=18)
        },
        {
            "enquiry_number": "RK-ENQ-2026-0006",
            "bride_name": "Aditi Roy Kapoor",
            "groom_name": "Kabir Mathur",
            "email": "aditi.rk@kapoorstudios.com",
            "phone": "+91 98200 99887",
            "preferred_date": now + timedelta(days=45),
            "destination": "Udaipur",
            "venue_preference": "Fateh Garh & Jagmandir Palace",
            "guest_count": 420,
            "function_count": 4,
            "functions_requested": ["Haldi & Pool Party", "Sangeet Under The Stars", "Vedic Pheras", "Royal Reception"],
            "theme_preference": "Classic Ivory, Rose Gold & Velvet Emerald",
            "budget_max": 28000000.00,
            "package_type": "full_service",
            "catering_preferences": "Luxury Rajasthani & Italian live pasta wheel",
            "decor_preferences": "50,000 Dutch roses Mandap overlooking lake Pichola",
            "additional_notes": "Agreement signed and booking deposit received! Converted to confirmed wedding.",
            "source": "Website",
            "status": "Confirmed",
            "assigned_planner_id": planner_id,
            "last_activity_at": now - timedelta(hours=5)
        },
        {
            "enquiry_number": "RK-ENQ-2026-0007",
            "bride_name": "Meera Doshi",
            "groom_name": "Varun Agarwal",
            "email": "meera.doshi@gmail.com",
            "phone": "+91 99200 11223",
            "preferred_date": now + timedelta(days=210),
            "destination": "Jodhpur",
            "venue_preference": "Umaid Bhawan Palace",
            "guest_count": 400,
            "function_count": 4,
            "functions_requested": ["Mehendi", "Sangeet", "Wedding", "Reception"],
            "theme_preference": "Art Deco Royal Heritage",
            "budget_max": 30000000.00,
            "package_type": "full_service",
            "source": "Website",
            "status": "New",
            "assigned_planner_id": None,
            "last_activity_at": now - timedelta(days=5) # Inactive 3+ days!
        },
        {
            "enquiry_number": "RK-ENQ-2026-0008",
            "bride_name": "Simran Sawhney",
            "groom_name": "Devansh Batra",
            "email": "simran.sawhney@gmail.com",
            "phone": "+91 98110 33445",
            "preferred_date": now + timedelta(days=300),
            "destination": "Jaipur",
            "venue_preference": "Jai Mahal Palace",
            "guest_count": 250,
            "function_count": 3,
            "functions_requested": ["Mehendi", "Sangeet", "Wedding"],
            "theme_preference": "Mughal Garden Romance",
            "budget_max": 12000000.00,
            "package_type": "full_service",
            "source": "Referral",
            "status": "Lost",
            "assigned_planner_id": planner_id,
            "additional_notes": "Client postponed wedding to next year due to family scheduling.",
            "last_activity_at": now - timedelta(days=10)
        }
    ]

    for ed in enquiries_data:
        enq = db.query(Enquiry).filter(Enquiry.enquiry_number == ed["enquiry_number"]).first()
        if not enq:
            enq = Enquiry(**ed)
            db.add(enq)
            db.commit()
            db.refresh(enq)
            
            # Add initial notes to enquiries
            note = EnquiryNote(
                enquiry_id=enq.id,
                author_id=planner_id,
                content=f"Initial requirement intake completed. Client priority: {enq.theme_preference}."
            )
            db.add(note)
            
            if enq.status == "Consultation Scheduled":
                consultation = Consultation(
                    enquiry_id=enq.id,
                    scheduled_at=now + timedelta(days=1, hours=4),
                    meeting_type="Zoom Video Consultation",
                    notes="Review palace layout options and caterer shortlists.",
                    status="Scheduled"
                )
                db.add(consultation)

    db.commit()

    # 5. Seed Confirmed Wedding Workspace for Aditi & Kabir
    confirmed_enquiry = db.query(Enquiry).filter(Enquiry.enquiry_number == "RK-ENQ-2026-0006").first()
    if confirmed_enquiry and not db.query(Wedding).filter(Wedding.wedding_number == "RK-WED-2026-001").first():
        wedding = Wedding(
            wedding_number="RK-WED-2026-001",
            enquiry_id=confirmed_enquiry.id,
            couple_title="Aditi & Kabir",
            bride_name="Aditi Roy Kapoor",
            groom_name="Kabir Mathur",
            primary_contact_name="Kabir Mathur",
            contact_phone="+91 98200 99887",
            contact_email="kabir.mathur@kapoorstudios.com",
            wedding_date_start=now + timedelta(days=45),
            wedding_date_end=now + timedelta(days=47),
            destination="Udaipur",
            venue_name="Fateh Garh & Jagmandir Island Palace",
            expected_guest_count=420,
            package_type="full_service",
            agreed_budget=28000000.00,
            assigned_planner_id=planner_id,
            status="Active"
        )
        db.add(wedding)
        db.commit()
        db.refresh(wedding)

        # Seed Wedding Events
        events = [
            ("Haldi & Carnival", "Poolside Courtyard, Fateh Garh", wedding.wedding_date_start, "10:30 AM", "02:30 PM", "Yellow Festive"),
            ("Royal Sangeet & Soundscape", "Main Palace Lawn, Fateh Garh", wedding.wedding_date_start, "07:30 PM", "01:30 AM", "Indo-Western Glitz"),
            ("Vedic Wedding Ceremony", "Lake Courtyard, Jagmandir Island", wedding.wedding_date_start + timedelta(days=1), "04:30 PM", "09:30 PM", "Royal Heritage"),
            ("The Imperial Reception", "Grand Ballroom, Jagmandir Palace", wedding.wedding_date_start + timedelta(days=1), "09:30 PM", "02:00 AM", "Black Tie & Velvet")
        ]
        for title, venue, dt, st, et, dc in events:
            db.add(WeddingEvent(
                wedding_id=wedding.id,
                title=title,
                venue=venue,
                event_date=dt,
                start_time=st,
                end_time=et,
                dress_code=dc
            ))
        db.commit()

        # Seed Client Milestones & Payments
        m1 = ClientPaymentMilestone(
            wedding_id=wedding.id,
            milestone_name="Booking Deposit (25%)",
            percentage=25.0,
            expected_amount=7000000.00,
            due_date=now - timedelta(days=10),
            status="Paid"
        )
        m2 = ClientPaymentMilestone(
            wedding_id=wedding.id,
            milestone_name="Advance Payment (50%)",
            percentage=50.0,
            expected_amount=14000000.00,
            due_date=now + timedelta(days=15),
            status="Pending"
        )
        m3 = ClientPaymentMilestone(
            wedding_id=wedding.id,
            milestone_name="Final Settlement (25%)",
            percentage=25.0,
            expected_amount=7000000.00,
            due_date=now + timedelta(days=50),
            status="Pending"
        )
        db.add_all([m1, m2, m3])
        db.commit()

        # Record received deposit
        db.add(ClientPayment(
            wedding_id=wedding.id,
            milestone_id=m1.id,
            amount=7000000.00,
            payment_date=now - timedelta(days=9),
            payment_method="NEFT / RTGS Transfer",
            transaction_reference="HDFC-RTGS-RK-20261019-9831",
            notes="Initial 25% booking deposit confirmed by finance."
        ))
        db.commit()

        # Log Activity
        db.add(ActivityLog(
            user_id=planner_id,
            wedding_id=wedding.id,
            action="WEDDING_CREATED",
            details={"wedding_number": wedding.wedding_number, "couple": wedding.couple_title}
        ))
        db.commit()

    print("The Royal Knot database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
