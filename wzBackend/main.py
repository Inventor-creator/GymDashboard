from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.sessions import SessionMiddleware
from database import models, engine
from authlib.integrations.starlette_client import OAuth
import os
from pathlib import Path
from dotenv import load_dotenv

from Routes.authRoutes import router as auth_router
from Routes.memberRoutes import router as member_router
from Routes.userRoutes import router as user_router
from Routes.gymRoutes import router as gym_router
from Routes.planRoutes import router as plan_router
from Routes.trainerRoutes import router as trainer_router
from Routes.financeRoutes import router as finance_router
from Routes.daypassRoutes import router as daypass_router

load_dotenv()

# Create tables (In production, use Alembic)


# Seed default plans for all existing gyms
from sqlalchemy.orm import Session
from database import SessionLocal
from database.models import Gym, Plan

DEFAULT_PLANS = [
    ("monthly", 500),
    ("quarterly", 1350),
    ("half yearly", 2500),
    ("yearly", 4500),
]

def seed_default_plans():
    try:
        db: Session = SessionLocal()
        gyms = db.query(Gym).all()
        for gym in gyms:
            for name, price in DEFAULT_PLANS:
                existing = db.query(Plan).filter(
                    Plan.gym_id == gym.gym_id,
                    Plan.name == name,
                ).first()
                if not existing:
                    plan = Plan(gym_id=gym.gym_id, name=name, price=price)
                    db.add(plan)
        db.commit()
        db.close()
    except Exception:
        pass  # Table might not exist yet on first run

seed_default_plans()

app = FastAPI(title="WorkoutZone Backend")

# Add Session Middleware
is_production = os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("RENDER") or os.getenv("PRODUCTION")
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY") or "",
    session_cookie="secure_session",
    max_age=3600,
    same_site="lax",
    https_only=bool(is_production),
    domain=None,
)

# Add CORS Middleware
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allow_origins = [frontend_url]
if is_production:
    allow_origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(member_router)
app.include_router(gym_router)
app.include_router(user_router)
app.include_router(plan_router)
app.include_router(trainer_router)
app.include_router(finance_router)
app.include_router(daypass_router)


@app.get("/api")
def read_root():
    return {"message": "Welcome to WorkoutZone API"}


# Serve frontend static files
FRONTEND_DIR = Path(__file__).parent.parent / "wzFrontend" / "dist"

if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        file_path = FRONTEND_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIR / "index.html")


if __name__ == "__main__":
    import uvicorn
    models.Base.metadata.create_all(bind=engine)
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
