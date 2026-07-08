from pydantic import BaseModel
from typing import Optional


class TrainerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None


class TrainerCreate(TrainerBase):
    pass

class TrainerUpdate(TrainerBase):
    pass


class TrainerResponse(TrainerBase):
    trainer_id: int
    gym_id: int
    is_active: bool

    class Config:
        from_attributes = True
