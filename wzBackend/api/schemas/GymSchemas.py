from pydantic import BaseModel
from typing import Optional

class GymBase(BaseModel):
    gym_name: str
    gym_location: str

class GymCreate(GymBase):
    owner_id: int

class GymResponse(GymBase):
    gym_id: int
    owner_id: int

    class Config:
        from_attributes = True

class GymOwnerUpdate(BaseModel):
    owner_id: int
