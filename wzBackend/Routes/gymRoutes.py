from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from database.models import Gym, User
from schemas.GymSchemas import GymCreate, GymResponse, GymOwnerUpdate

router = APIRouter(prefix="/gyms", tags=["Gyms"])

ADMIN_EMAIL = "aryaupatil9@gmail.com"

def get_current_user(request: Request):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

def check_admin(user = Depends(get_current_user)):
    if user.get("email") != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Not authorized")
    return user

@router.get("/my", response_model=List[GymResponse])
def get_my_gyms(db: Session = Depends(get_db), user = Depends(get_current_user)):
    gyms = db.query(Gym).join(User).filter(User.email == user["email"]).all()

    return gyms

@router.get("/", response_model=List[GymResponse])
def get_all_gyms(db: Session = Depends(get_db), _ = Depends(check_admin)):
    gyms = db.query(Gym).all()
    return gyms

@router.post("/", response_model=GymResponse)
def create_gym(gym: GymCreate, db: Session = Depends(get_db), _ = Depends(check_admin)):
    db_gym = Gym(
        gym_name=gym.gym_name,
        gym_location=gym.gym_location,
        owner_id=gym.owner_id
    )
    db.add(db_gym)
    db.commit()
    db.refresh(db_gym)
    return db_gym

@router.put("/{gym_id}/owner", response_model=GymResponse)
def update_gym_owner(gym_id: int, update: GymOwnerUpdate, db: Session = Depends(get_db), _ = Depends(check_admin)):
    db_gym = db.query(Gym).filter(Gym.gym_id == gym_id).first()
    if not db_gym:
        raise HTTPException(status_code=404, detail="Gym not found")

    db_gym.owner_id = update.owner_id
    db.commit()
    db.refresh(db_gym)
    return db_gym
