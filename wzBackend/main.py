from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from database import models, engine
from authlib.integrations.starlette_client import OAuth
import os
from dotenv import load_dotenv

from Routes.authRoutes import router as auth_router
from Routes.memberRoutes import router as member_router
from Routes.userRoutes import router as user_router
from Routes.gymRoutes import router as gym_router
from Routes.planRoutes import router as plan_router
from Routes.trainerRoutes import router as trainer_router
from Routes.financeRoutes import router as finance_router

load_dotenv()

# Create tables (In production, use Alembic)
models.Base.metadata.create_all(bind=engine)

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
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY") or "",
    session_cookie="secure_session",
    max_age=3600,
    same_site="lax",
    https_only=False,
    domain=None,
)

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
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


@app.get("/")
def read_root():
    return {"message": "Welcome to WorkoutZone API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)
