from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import get_db
from database.models import Member, Transactions, Gym
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/day-passes", tags=["Day Passes"])

class DayPassCreate(BaseModel):
    name: str
    email: EmailStr
    phone_number: str
    amount: float
    payment_method: str = "cash"
    payment_remark: Optional[str] = None

class DayPassResponse(BaseModel):
    transaction_id: int
    member_name: str
    amount: float
    date: date
    payment_method: str
    remark: Optional[str]

@router.post("/", response_model=DayPassResponse)
def create_day_pass(pay_load: DayPassCreate, db: Session = Depends(get_db), x_gym_id: Optional[int] = Header(None)):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")

    # Find or create the member
    db_member = db.query(Member).filter(Member.email == pay_load.email).first()
    if not db_member:
        db_member = Member(
            name=pay_load.name,
            email=pay_load.email,
            phone_number=pay_load.phone_number,
        )
        db.add(db_member)
        db.flush()

    # Create the transaction
    tx = Transactions(
        member_id=db_member.member_id,
        gym_id=int(x_gym_id),
        amount=pay_load.amount,
        status="paid",
        paid_by=pay_load.payment_method,
        payment_method=pay_load.payment_method,
        date=date.today(),
        plan_name="Day Pass",
        remark=pay_load.payment_remark,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    return {
        "transaction_id": tx.transaction_id,
        "member_name": db_member.name,
        "amount": float(tx.amount),
        "date": tx.date,
        "payment_method": tx.payment_method,
        "remark": tx.remark,
    }

@router.get("/", response_model=List[DayPassResponse])
def get_day_passes(db: Session = Depends(get_db), x_gym_id: Optional[int] = Header(None)):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")

    results = (
        db.query(Transactions, Member.name)
        .join(Member, Transactions.member_id == Member.member_id)
        .filter(Transactions.gym_id == int(x_gym_id), Transactions.plan_name == "Day Pass")
        .order_by(Transactions.date.desc())
        .all()
    )

    output = []
    for tx, member_name in results:
        output.append({
            "transaction_id": tx.transaction_id,
            "member_name": member_name,
            "amount": float(tx.amount),
            "date": tx.date,
            "payment_method": tx.payment_method,
            "remark": tx.remark,
        })
    return output
