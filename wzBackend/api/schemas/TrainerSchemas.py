from pydantic import BaseModel
from typing import Optional, List


class TrainerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None


class TrainerCreate(TrainerBase):
    gym_id: int


class TrainerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    is_active: Optional[bool] = None


class TrainerPlanBase(BaseModel):
    name: str
    price: float
    duration_days: int = 30


class TrainerPlanCreate(TrainerPlanBase):
    pass


class TrainerPlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    is_active: Optional[bool] = None


class TrainerPlanResponse(TrainerPlanBase):
    plan_id: int
    trainer_id: int
    is_active: bool

    class Config:
        from_attributes = True


class TrainerResponse(TrainerBase):
    trainer_id: int
    gym_id: int
    is_active: bool
    plans: List[TrainerPlanResponse] = []

    class Config:
        from_attributes = True