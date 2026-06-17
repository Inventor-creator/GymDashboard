from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class MemberBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    plan: str

class MemberCreate(MemberBase):
    gym_id: int

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    plan: Optional[str] = None

class MemberResponse(MemberBase):
    member_id: int
    joining_date: datetime

    class Config:
        from_attributes = True
