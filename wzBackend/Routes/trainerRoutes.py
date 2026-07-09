from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from database import get_db
from database.models import Trainer, TrainerPlan, Gym
from schemas.TrainerSchemas import (
    TrainerCreate,
    TrainerResponse,
    TrainerUpdate,
    TrainerPlanCreate,
    TrainerPlanUpdate,
    TrainerPlanResponse,
)

router = APIRouter(prefix="/trainers", tags=["Trainers"])


@router.get("/", response_model=List[TrainerResponse])
def get_trainers(db: Session = Depends(get_db), x_gym_id: Optional[int] = Header(None)):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")
    trainers = db.query(Trainer).filter(Trainer.gym_id == x_gym_id, Trainer.is_active == True).all()
    return trainers


@router.post("/", response_model=TrainerResponse)
def create_trainer(trainer: TrainerCreate, db: Session = Depends(get_db), x_gym_id: Optional[int] = Header(None)):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")
    db_gym = db.query(Gym).filter(Gym.gym_id == x_gym_id).first()
    if not db_gym:
        raise HTTPException(status_code=404, detail="Gym not found")

    db_trainer = Trainer(
        gym_id=x_gym_id,
        name=trainer.name,
        email=trainer.email,
        phone=trainer.phone,
        specialization=trainer.specialization,
    )
    db.add(db_trainer)
    db.commit()
    db.refresh(db_trainer)
    return db_trainer


@router.put("/{trainer_id}", response_model=TrainerResponse)
def update_trainer(trainer_id: int, trainer_update: TrainerUpdate, db: Session = Depends(get_db)):
    db_trainer = db.query(Trainer).filter(Trainer.trainer_id == trainer_id).first()
    if not db_trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    update_data = trainer_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_trainer, key, value)

    db.commit()
    db.refresh(db_trainer)
    return db_trainer


@router.delete("/{trainer_id}")
def delete_trainer(trainer_id: int, db: Session = Depends(get_db)):
    db_trainer = db.query(Trainer).filter(Trainer.trainer_id == trainer_id).first()
    if not db_trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    db_trainer.is_active = False
    db.commit()
    return {"detail": "Trainer deactivated"}


@router.get("/{trainer_id}/plans", response_model=List[TrainerPlanResponse])
def get_trainer_plans(trainer_id: int, db: Session = Depends(get_db)):
    plans = db.query(TrainerPlan).filter(TrainerPlan.trainer_id == trainer_id).all()
    return plans


@router.post("/{trainer_id}/plans", response_model=TrainerPlanResponse)
def create_trainer_plan(trainer_id: int, plan: TrainerPlanCreate, db: Session = Depends(get_db)):
    db_trainer = db.query(Trainer).filter(Trainer.trainer_id == trainer_id).first()
    if not db_trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    db_plan = TrainerPlan(
        trainer_id=trainer_id,
        name=plan.name,
        price=plan.price,
        duration_days=plan.duration_days,
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.put("/{trainer_id}/plans/{plan_id}", response_model=TrainerPlanResponse)
def update_trainer_plan(trainer_id: int, plan_id: int, plan_update: TrainerPlanUpdate, db: Session = Depends(get_db)):
    db_plan = db.query(TrainerPlan).filter(TrainerPlan.plan_id == plan_id, TrainerPlan.trainer_id == trainer_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Trainer plan not found")

    update_data = plan_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_plan, key, value)

    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.delete("/{trainer_id}/plans/{plan_id}")
def delete_trainer_plan(trainer_id: int, plan_id: int, db: Session = Depends(get_db)):
    db_plan = db.query(TrainerPlan).filter(TrainerPlan.plan_id == plan_id, TrainerPlan.trainer_id == trainer_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Trainer plan not found")
    db_plan.is_active = False
    db.commit()
    return {"detail": "Trainer plan deactivated"}
