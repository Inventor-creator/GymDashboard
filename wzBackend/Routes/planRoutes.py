from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from database.models import Plan, Gym
from schemas.PlanSchemas import PlanCreate, PlanResponse, PlanUpdate

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.get("/", response_model=List[PlanResponse])
def get_plans(db: Session = Depends(get_db), x_gym_id: Optional[int] = Header(None)):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")
    plans = db.query(Plan).filter(Plan.gym_id == x_gym_id).all()
    return plans


@router.post("/", response_model=PlanResponse)
def create_plan(plan: PlanCreate, db: Session = Depends(get_db)):
    db_gym = db.query(Gym).filter(Gym.gym_id == plan.gym_id).first()
    if not db_gym:
        raise HTTPException(status_code=404, detail="Gym not found")

    existing = db.query(Plan).filter(
        Plan.gym_id == plan.gym_id, Plan.name == plan.name, Plan.is_active == True
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Plan with this name already exists")

    db_plan = Plan(gym_id=plan.gym_id, name=plan.name, price=plan.price, duration_days=plan.duration_days)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.put("/{plan_id}", response_model=PlanResponse)
def update_plan(plan_id: int, plan_update: PlanUpdate, db: Session = Depends(get_db)):
    db_plan = db.query(Plan).filter(Plan.plan_id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    update_data = plan_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_plan, key, value)

    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.delete("/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    db_plan = db.query(Plan).filter(Plan.plan_id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db_plan.is_active = False
    db.commit()
    return {"detail": "Plan deactivated"}
