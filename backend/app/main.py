import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.models import * # Load all models
from app.api import (
    auth,
    enquiries,
    dashboard,
    contracts,
    weddings,
    vendors,
    guests,
    live_ops,
    finance,
    reports,
    team,
    calendar,
    settings as settings_api
)
from app.services.live_ops_service import LiveOpsService

# Create tables
Base.metadata.create_all(bind=engine)

def scheduled_vendor_late_check():
    """Background task running every minute to flag late arriving vendors."""
    db = SessionLocal()
    try:
        LiveOpsService.run_minute_late_vendor_check(db)
    except Exception as e:
        print(f"[APScheduler] Vendor late check error: {e}")
    finally:
        db.close()

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        scheduler.add_job(scheduled_vendor_late_check, "interval", minutes=1, id="vendor_late_checker", replace_existing=True)
        scheduler.start()
        print("[APScheduler] Background vendor late-check daemon started.")
    except Exception as e:
        print(f"[APScheduler] Startup error: {e}")
    yield
    # Shutdown
    try:
        scheduler.shutdown(wait=False)
        print("[APScheduler] Background scheduler shut down.")
    except Exception:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="The Royal Knot – Luxury Wedding Planning Management Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allow frontend dev & local ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount upload directory
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(enquiries.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(contracts.router, prefix=settings.API_V1_STR)
app.include_router(weddings.router, prefix=settings.API_V1_STR)
app.include_router(vendors.router, prefix=settings.API_V1_STR)
app.include_router(guests.router, prefix=settings.API_V1_STR)
app.include_router(live_ops.router, prefix=settings.API_V1_STR)
app.include_router(finance.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(team.router, prefix=settings.API_V1_STR)
app.include_router(calendar.router, prefix=settings.API_V1_STR)
app.include_router(settings_api.router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }
