from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from database.models import Member, Gym, MemberGym, Plan
from schemas.MemberSchemas import MemberCreate, MemberResponse, MemberUpdate

router = APIRouter(prefix="/members", tags=["Members"])


@router.get("/", response_model=List[MemberResponse])
def get_members(db: Session = Depends(get_db), x_gym_id: Optional[int] = Header(None)):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")

    results = (
        db.query(Member, MemberGym)
        .join(MemberGym, Member.member_id == MemberGym.member_id)
        .filter(MemberGym.gym_id == x_gym_id)
        .all()
    )

    output = []
    for member, member_gym in results:
        output.append(
            {
                "member_id": member.member_id,
                "name": member.name,
                "email": member.email,
                "phone_number": member.phone_number,
                "plan": member_gym.plan,
                "plan_price": float(member_gym.plan_price),
                "joining_date": member_gym.joining_date,
                "has_personal_training": member_gym.has_personal_training,
                "personal_training_cost": float(member_gym.personal_training_cost),
                "total_owed": float(member_gym.total_owed),
                "paid": member_gym.paid,
                "payment_method": member_gym.payment_method,
                "payment_remark": member_gym.payment_remark,
            }
        )
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
            phone_number=member.phone_number,
        )
        db.add(db_member)
        db.flush()

    # Check if already a member of this gym
    existing_membership = db.query(MemberGym).filter(
        MemberGym.member_id == db_member.member_id,
        MemberGym.gym_id == member.gym_id,
    ).first()

    if existing_membership:
        raise HTTPException(status_code=400, detail="User is already a member of this gym")

    # Determine plan name and price
    plan_name = member.plan
    if member.custom_plan_name and member.custom_plan_price is not None:
        plan_name = member.custom_plan_name
        plan_price = member.custom_plan_price
    else:
        plan_name = member.plan
        db_plan = (
            db.query(Plan)
            .filter(
                Plan.gym_id == member.gym_id,
                Plan.name == member.plan,
                Plan.is_active == True,
            )
            .first()
        )
        plan_price = float(db_plan.price) if db_plan else member.plan_price

    # Auto-calculate total owed
    total_owed = plan_price + (member.personal_training_cost if member.has_personal_training else 0)

    db_membership = MemberGym(
        member_id=db_member.member_id,
        gym_id=member.gym_id,
        plan=plan_name,
        plan_price=plan_price,
        joining_date=datetime.now(),
        has_personal_training=member.has_personal_training,
        personal_training_cost=member.personal_training_cost if member.has_personal_training else 0,
        total_owed=total_owed,
        paid=member.paid,
        payment_method=member.payment_method,
        payment_remark=member.payment_remark,
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
        "plan_price": float(db_membership.plan_price),
        "joining_date": db_membership.joining_date,
        "has_personal_training": db_membership.has_personal_training,
        "personal_training_cost": float(db_membership.personal_training_cost),
        "total_owed": float(total_owed),
        "paid": db_membership.paid,
        "payment_method": db_membership.payment_method,
        "payment_remark": db_membership.payment_remark,
    }


@router.put("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: int,
    member_update: MemberUpdate,
    db: Session = Depends(get_db),
    x_gym_id: Optional[int] = Header(None),
):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")

    db_member = db.query(Member).filter(Member.member_id == member_id).first()
    db_membership = db.query(MemberGym).filter(
        MemberGym.member_id == member_id,
        MemberGym.gym_id == x_gym_id,
    ).first()

    if not db_member or not db_membership:
        raise HTTPException(status_code=404, detail="Member or Membership not found")

    update_data = member_update.dict(exclude_unset=True)

    # Member-level fields
    if "name" in update_data:
        db_member.name = update_data["name"]
    if "email" in update_data:
        db_member.email = update_data["email"]
    if "phone_number" in update_data:
        db_member.phone_number = update_data["phone_number"]

    # Membership-level fields
    if "plan" in update_data:
        db_membership.plan = update_data["plan"]

    # Handle custom plan or plan price update
    if update_data.get("custom_plan_name") and update_data.get("custom_plan_price") is not None:
        db_membership.plan = update_data["custom_plan_name"]
        db_membership.plan_price = update_data["custom_plan_price"]
    elif "plan_price" in update_data:
        db_membership.plan_price = update_data["plan_price"]

    if "has_personal_training" in update_data:
        db_membership.has_personal_training = update_data["has_personal_training"]
        if not update_data["has_personal_training"]:
            db_membership.personal_training_cost = 0

    if "personal_training_cost" in update_data:
        db_membership.personal_training_cost = update_data["personal_training_cost"]

    if "paid" in update_data:
        db_membership.paid = update_data["paid"]
    if "payment_method" in update_data:
        db_membership.payment_method = update_data["payment_method"]
    if "payment_remark" in update_data:
        db_membership.payment_remark = update_data["payment_remark"]

    # Recalculate total_owed
    plan_price = float(db_membership.plan_price)
    pt_cost = float(db_membership.personal_training_cost) if db_membership.has_personal_training else 0
    db_membership.total_owed = plan_price + pt_cost

    db.commit()
    db.refresh(db_member)
    db.refresh(db_membership)

    return {
        "member_id": db_member.member_id,
        "name": db_member.name,
        "email": db_member.email,
        "phone_number": db_member.phone_number,
        "plan": db_membership.plan,
        "plan_price": float(db_membership.plan_price),
        "joining_date": db_membership.joining_date,
        "has_personal_training": db_membership.has_personal_training,
        "personal_training_cost": float(db_membership.personal_training_cost),
        "total_owed": float(db_membership.total_owed),
        "paid": db_membership.paid,
        "payment_method": db_membership.payment_method,
        "payment_remark": db_membership.payment_remark,
    }
