from pydantic import BaseModel
from typing import Optional


class PlanBase(BaseModel):
    name: str
    price: float
    duration_days: int = 30


class PlanCreate(PlanBase):
    gym_id: int


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    duration_days: Optional[int] = None
    is_active: Optional[bool] = None


class PlanResponse(PlanBase):
    plan_id: int
    gym_id: int
    is_active: bool

    class Config:
        from_attributes = True
