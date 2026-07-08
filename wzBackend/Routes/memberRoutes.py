from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
from database import get_db
from database.models import Member, Gym, MemberGym, Plan, Transactions, Trainer
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

    trainer_map = {t.trainer_id: t.name for t in db.query(Trainer).filter(Trainer.gym_id == x_gym_id).all()}
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
                "assigned_trainer_id": member_gym.assigned_trainer_id,
                "assigned_trainer_name": trainer_map.get(member_gym.assigned_trainer_id) if member_gym.assigned_trainer_id else None,
                "total_owed": float(member_gym.total_owed),
                "paid": member_gym.paid,
                "payment_method": member_gym.payment_method,
                "payment_remark": member_gym.payment_remark,
                "next_billing_date": member_gym.next_billing_date,
                "is_active": member_gym.is_active,
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

    if existing_membership and existing_membership.is_active:
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
        plan_duration = db_plan.duration_days if db_plan else 30

    if member.custom_plan_name and member.custom_plan_price is not None:
        plan_duration = member.custom_plan_duration or 30

    # Determine personal training cost from assigned trainer
    pt_cost = 0
    if member.assigned_trainer_id:
        trainer = db.query(Trainer).filter(Trainer.trainer_id == member.assigned_trainer_id).first()
        member_form_has_pt = True
    else:
        member_form_has_pt = member.has_personal_training
        pt_cost = member.personal_training_cost if member_form_has_pt else 0

    # Calculate total cost
    total_cost = plan_price + pt_cost

    # Calculate running balance (total_owed) and paid status
    total_owed = max(0.0, total_cost - member.initial_paid_amount)
    paid_status = (total_owed <= 0)

    if existing_membership and not existing_membership.is_active:
        existing_membership.plan = plan_name
        existing_membership.plan_price = plan_price
        existing_membership.joining_date = datetime.now()
        existing_membership.next_billing_date = date.today() + timedelta(days=plan_duration)
        existing_membership.has_personal_training = member_form_has_pt
        existing_membership.personal_training_cost = pt_cost
        existing_membership.assigned_trainer_id = member.assigned_trainer_id
        existing_membership.total_owed = total_owed
        existing_membership.paid = paid_status
        existing_membership.payment_method = member.payment_method
        existing_membership.payment_remark = member.payment_remark
        existing_membership.is_active = True
        db_membership = existing_membership
    else:
        db_membership = MemberGym(
            member_id=db_member.member_id,
            gym_id=member.gym_id,
            plan=plan_name,
            plan_price=plan_price,
            joining_date=datetime.now(),
            next_billing_date=date.today() + timedelta(days=plan_duration),
            has_personal_training=member_form_has_pt,
            personal_training_cost=pt_cost,
            assigned_trainer_id=member.assigned_trainer_id,
            total_owed=total_owed,
            paid=paid_status,
            payment_method=member.payment_method,
            payment_remark=member.payment_remark,
        )
        db.add(db_membership)

    if member.initial_paid_amount > 0:
        tx = Transactions(
            member_id=db_member.member_id,
            gym_id=member.gym_id,
            amount=member.initial_paid_amount,
            status="paid",
            paid_by=member.payment_method,
            payment_method=member.payment_method,
            date=date.today(),
            plan_name=plan_name,
            remark=member.payment_remark,
        )
        db.add(tx)

    db.commit()
    db.refresh(db_member)
    db.refresh(db_membership)

    trainer_name = None
    if db_membership.assigned_trainer_id:
        t = db.query(Trainer).filter(Trainer.trainer_id == db_membership.assigned_trainer_id).first()
        trainer_name = t.name if t else None

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
        "assigned_trainer_id": db_membership.assigned_trainer_id,
        "assigned_trainer_name": trainer_name,
        "total_owed": float(total_owed),
        "paid": db_membership.paid,
        "payment_method": db_membership.payment_method,
        "payment_remark": db_membership.payment_remark,
        "next_billing_date": db_membership.next_billing_date,
        "is_active": db_membership.is_active,
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
    #filter member
    db_membership = db.query(MemberGym).filter(
        MemberGym.member_id == member_id,
        MemberGym.gym_id == x_gym_id,
    ).first()

    if not db_member or not db_membership:
        raise HTTPException(status_code=404, detail="Member or Membership not found")

    update_data = member_update.dict(exclude_unset=True)

    # Save old total cost to adjust running balance safely
    old_plan_price = float(db_membership.plan_price)
    old_pt_cost = float(db_membership.personal_training_cost) if db_membership.has_personal_training else 0
    old_total_cost = old_plan_price + old_pt_cost
    old_plan_name = db_membership.plan

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
    if "is_active" in update_data:
        db_membership.is_active = update_data["is_active"]
    # If the plan changed, we need to adjust the next_billing_date
    if db_membership.plan != old_plan_name:
        # Find old duration
        old_plan_db = db.query(Plan).filter(Plan.gym_id == x_gym_id, Plan.name == old_plan_name).first()
        old_duration = old_plan_db.duration_days if old_plan_db else 30

        # Find new duration
        if update_data.get("custom_plan_name") and update_data.get("custom_plan_duration") is not None:
            new_duration = update_data["custom_plan_duration"]
        else:
            new_plan_db = db.query(Plan).filter(Plan.gym_id == x_gym_id, Plan.name == db_membership.plan).first()
            new_duration = new_plan_db.duration_days if new_plan_db else 30

        if db_membership.next_billing_date:
            db_membership.next_billing_date = db_membership.next_billing_date - timedelta(days=old_duration) + timedelta(days=new_duration)

    if "assigned_trainer_id" in update_data:
        db_membership.assigned_trainer_id = update_data["assigned_trainer_id"]

    # Recalculate total_owed by adjusting for any price differences
    new_plan_price = float(db_membership.plan_price)
    new_pt_cost = float(db_membership.personal_training_cost) if db_membership.has_personal_training else 0
    new_total_cost = new_plan_price + new_pt_cost

    cost_difference = new_total_cost - old_total_cost
    db_membership.total_owed = max(0.0, float(db_membership.total_owed) + cost_difference)

    # Sync paid status
    if db_membership.total_owed <= 0:
        db_membership.paid = True
    else:
        db_membership.paid = False

    db.commit()
    db.refresh(db_member)
    db.refresh(db_membership)

    trainer_name = None
    if db_membership.assigned_trainer_id:
        t = db.query(Trainer).filter(Trainer.trainer_id == db_membership.assigned_trainer_id).first()
        trainer_name = t.name if t else None

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
        "assigned_trainer_id": db_membership.assigned_trainer_id,
        "assigned_trainer_name": trainer_name,
        "total_owed": float(db_membership.total_owed),
        "paid": db_membership.paid,
        "payment_method": db_membership.payment_method,
        "payment_remark": db_membership.payment_remark,
        "next_billing_date": db_membership.next_billing_date,
        "is_active": db_membership.is_active,
    }


@router.delete("/{member_id}")
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    x_gym_id: Optional[int] = Header(None),
):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")

    db_membership = db.query(MemberGym).filter(
        MemberGym.member_id == member_id,
        MemberGym.gym_id == x_gym_id,
    ).first()

    if not db_membership:
        raise HTTPException(status_code=404, detail="Membership not found")

    db_membership.is_active = False
    db.commit()
    return {"detail": "Member removed successfully"}
