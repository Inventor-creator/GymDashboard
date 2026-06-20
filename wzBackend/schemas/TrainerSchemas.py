from pydantic import BaseModel
from typing import Optional


class TrainerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    charge_per_session: float = 0


class TrainerCreate(TrainerBase):
    gym_id: int


class TrainerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    charge_per_session: Optional[float] = None
    is_active: Optional[bool] = None


class TrainerResponse(TrainerBase):
    trainer_id: int
    gym_id: int
    is_active: bool

    class Config:
        from_attributes = True
