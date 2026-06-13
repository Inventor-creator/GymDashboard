from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    full_name: Optional[str] = None

class User(UserBase):

    model_config = {
        "from_attributes": True
    }

    id: int
    full_name: Optional[str] = None
    is_active: bool
