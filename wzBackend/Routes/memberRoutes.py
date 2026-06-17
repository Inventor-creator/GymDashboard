from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from database.models import Member, Gym, MemberGym
from schemas.MemberSchemas import MemberCreate, MemberResponse, MemberUpdate

router = APIRouter(prefix="/members", tags=["Members"])

@router.get("/", response_model=List[MemberResponse])
def get_members(db: Session = Depends(get_db), x_gym_id: Optional[int] = Header(None)):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")

    results = db.query(Member, MemberGym).join(MemberGym, Member.member_id == MemberGym.member_id).filter(MemberGym.gym_id == x_gym_id).all()

    output = []
    for member, member_gym in results:
        output.append({
            "member_id": member.member_id,
            "name": member.name,
            "email": member.email,
            "phone_number": member.phone_number,
            "plan": member_gym.plan,
            "joining_date": member_gym.joining_date
        })
    return output

@router.post("/", response_model=MemberResponse)
def create_member(member: MemberCreate, db: Session = Depends(get_db)):
    db_gym = db.query(Gym).filter(Gym.gym_id == member.gym_id).first()
    if not db_gym:
        raise HTTPException(status_code=404, detail="Gym not found")

    # Check if member exists by email
    db_member = db.query(Member).filter(Member.email == member.email).first()
    if not db_member:
        db_member = Member(
            name=member.name,
            email=member.email,
            phone_number=member.phone_number
        )
        db.add(db_member)
        db.flush()

    # Check if already a member of this gym
    existing_membership = db.query(MemberGym).filter(
        MemberGym.member_id == db_member.member_id,
        MemberGym.gym_id == member.gym_id
    ).first()

    if existing_membership:
        raise HTTPException(status_code=400, detail="User is already a member of this gym")

    db_membership = MemberGym(
        member_id=db_member.member_id,
        gym_id=member.gym_id,
        plan=member.plan,
        joining_date=datetime.now()
    )
    db.add(db_membership)
    db.commit()
    db.refresh(db_member)
    db.refresh(db_membership)

    return {
        "member_id": db_member.member_id,
        "name": db_member.name,
        "email": db_member.email,
        "phone_number": db_member.phone_number,
        "plan": db_membership.plan,
        "joining_date": db_membership.joining_date
    }

@router.put("/{member_id}", response_model=MemberResponse)
def update_member(member_id: int, member_update: MemberUpdate, db: Session = Depends(get_db), x_gym_id: Optional[int] = Header(None)):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")

    db_member = db.query(Member).filter(Member.member_id == member_id).first()
    db_membership = db.query(MemberGym).filter(
        MemberGym.member_id == member_id,
        MemberGym.gym_id == x_gym_id
    ).first()

    if not db_member or not db_membership:
        raise HTTPException(status_code=404, detail="Member or Membership not found")

    update_data = member_update.dict(exclude_unset=True)

    if "name" in update_data: db_member.name = update_data["name"]
    if "email" in update_data: db_member.email = update_data["email"]
    if "phone_number" in update_data: db_member.phone_number = update_data["phone_number"]
    if "plan" in update_data: db_membership.plan = update_data["plan"]

    db.commit()
    db.refresh(db_member)
    db.refresh(db_membership)

    return {
        "member_id": db_member.member_id,
        "name": db_member.name,
        "email": db_member.email,
        "phone_number": db_member.phone_number,
        "plan": db_membership.plan,
        "joining_date": db_membership.joining_date
    }
