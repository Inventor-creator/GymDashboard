from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from database.models import Member, Gym
from schemas.MemberSchemas import MemberCreate, MemberResponse

router = APIRouter(prefix="/members", tags=["Members"])

@router.get("/", response_model=List[MemberResponse])
def get_members(db: Session = Depends(get_db), x_gym_id: Optional[int] = Header(None)):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")
    members = db.query(Member).join(Member.gyms).filter(Gym.gym_id == x_gym_id).all()
    return members

@router.post("/", response_model=MemberResponse)
def create_member(member: MemberCreate, db: Session = Depends(get_db)):
    db_gym = db.query(Gym).filter(Gym.gym_id == member.gym_id).first()
    if not db_gym:
        raise HTTPException(status_code=404, detail="Gym not found")

    db_member = Member(
        name=member.name,
        email=member.email,
        phone_number=member.phone_number,
        plan=member.plan
    )
    db_member.gyms.append(db_gym)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member
