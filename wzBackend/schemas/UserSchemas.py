from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):

    model_config = {
        "from_attributes": True
    }

    id: int
    is_active: bool
