from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class MemberBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    plan: str
    plan_price: float = 0
    has_personal_training: bool = False
    personal_training_cost: float = 0
    paid: bool = False
    payment_method: str = "cash"
    payment_remark: Optional[str] = None
    initial_paid_amount: float = 0


class MemberCreate(MemberBase):
    gym_id: int
    custom_plan_name: Optional[str] = None
    custom_plan_price: Optional[float] = None
    custom_plan_duration: Optional[int] = None


class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    plan: Optional[str] = None
    plan_price: Optional[float] = None
    has_personal_training: Optional[bool] = None
    personal_training_cost: Optional[float] = None
    paid: Optional[bool] = None
    payment_method: Optional[str] = None
    payment_remark: Optional[str] = None
    custom_plan_name: Optional[str] = None
    custom_plan_price: Optional[float] = None
    custom_plan_duration: Optional[int] = None


class MemberResponse(MemberBase):
    member_id: int
    joining_date: datetime
    next_billing_date: Optional[datetime] = None
    total_owed: float

    class Config:
        from_attributes = True
