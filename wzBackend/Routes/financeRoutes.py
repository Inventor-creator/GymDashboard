from fastapi import APIRouter, Depends, HTTPException, Header, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime, date
from database import get_db
from database.models import Transactions, Member, MemberGym, Gym, Plan
from datetime import timedelta
from schemas.FinanceSchemas import (
    FinanceSummary,
    MonthlyBreakdown,
    RevenueBySource,
    TransactionResponse,
    PaymentRecord,
    OutstandingMember,
)

router = APIRouter(prefix="/finances", tags=["Finances"])


@router.get("/summary", response_model=FinanceSummary)
def get_finance_summary(
    db: Session = Depends(get_db),
    x_gym_id: Optional[int] = Header(None),
):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")

    # Total income YTD: sum of paid transaction amounts for this year
    current_year = datetime.now().year
    total_income = (
        db.query(func.coalesce(func.sum(Transactions.amount), 0))
        .filter(
            Transactions.gym_id == x_gym_id,
            Transactions.status == "paid",
            func.extract("year", Transactions.date) == current_year,
        )
        .scalar()
    )

    # Outstanding: sum of unpaid total_owed
    outstanding = (
        db.query(func.coalesce(func.sum(MemberGym.total_owed), 0))
        .filter(
            MemberGym.gym_id == x_gym_id,
            MemberGym.paid == False,
        )
        .scalar()
    )

    # Active members count
    active_members = (
        db.query(func.count(MemberGym.member_id))
        .filter(MemberGym.gym_id == x_gym_id)
        .scalar()
    )

    # Monthly breakdown - income from transactions grouped by month
    monthly_rows = (
        db.query(
            func.date_trunc("month", Transactions.date).label("month"),
            func.coalesce(func.sum(Transactions.amount), 0),
        )
        .filter(
            Transactions.gym_id == x_gym_id,
            Transactions.status == "paid",
            func.extract("year", Transactions.date) == current_year,
        )
        .group_by(func.date_trunc("month", Transactions.date))
        .order_by(func.date_trunc("month", Transactions.date))
        .all()
    )

    monthly_breakdown = []
    for row in monthly_rows:
        month_str = row[0].strftime("%Y-%m") if row[0] else ""
        monthly_breakdown.append(
            MonthlyBreakdown(month=month_str, income=float(row[1]), pt_income=0)
        )

    # Revenue by source: membership fees vs PT
    # Membership fees from member_gyms where plan_price is counted, PT from personal_training_cost
    membership_fees = (
        db.query(func.coalesce(func.sum(MemberGym.plan_price), 0))
        .filter(MemberGym.gym_id == x_gym_id)
        .scalar()
    )
    pt_income = (
        db.query(func.coalesce(func.sum(MemberGym.personal_training_cost), 0))
        .filter(
            MemberGym.gym_id == x_gym_id,
            MemberGym.has_personal_training == True,
        )
        .scalar()
    )

    # New signups this month
    first_of_month = datetime(current_year, datetime.now().month, 1)
    new_signups = (
        db.query(func.count(MemberGym.member_id))
        .filter(
            MemberGym.gym_id == x_gym_id,
            MemberGym.joining_date >= first_of_month,
        )
        .scalar()
    )

    return FinanceSummary(
        total_income_ytd=float(total_income),
        outstanding_revenue=float(outstanding),
        active_members=active_members,
        monthly_breakdown=monthly_breakdown,
        revenue_by_source=RevenueBySource(
            membership_fees=float(membership_fees),
            personal_training=float(pt_income),
        ),
        new_signups_this_month=new_signups,
    )


@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    paid: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    x_gym_id: Optional[int] = Header(None),
):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")

    query = (
        db.query(Transactions, Member.name)
        .join(Member, Transactions.member_id == Member.member_id)
        .filter(Transactions.gym_id == x_gym_id, Transactions.is_active == True)
    )

    if paid == "true":
        query = query.filter(Transactions.status == "paid")
    elif paid == "false":
        query = query.filter(Transactions.status != "paid")

    if search:
        query = query.filter(Member.name.ilike(f"%{search}%"))

    results = query.order_by(Transactions.date.desc()).all()

    output = []
    for tx, member_name in results:
        output.append(
            TransactionResponse(
                transaction_id=tx.transaction_id,
                member_id=tx.member_id,
                member_name=member_name,
                gym_id=tx.gym_id,
                amount=float(tx.amount) if tx.amount else 0,
                date=tx.date,
                status=tx.status,
                plan_name=tx.plan_name,
                paid_by=tx.paid_by,
                payment_method=tx.payment_method,
                remark=tx.remark,
            )
        )
    return output


@router.get("/outstanding", response_model=List[OutstandingMember])
def get_outstanding_members(
    db: Session = Depends(get_db),
    x_gym_id: Optional[int] = Header(None),
):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")

    rows = (
        db.query(Member, MemberGym)
        .join(MemberGym, Member.member_id == MemberGym.member_id)
        .filter(MemberGym.gym_id == x_gym_id, MemberGym.paid == False)
        .all()
    )

    output = []
    for member, mg in rows:
        output.append(
            OutstandingMember(
                member_id=member.member_id,
                member_name=member.name,
                plan=mg.plan,
                plan_price=float(mg.plan_price),
                has_personal_training=mg.has_personal_training,
                personal_training_cost=float(mg.personal_training_cost),
                total_owed=float(mg.total_owed),
                payment_method=mg.payment_method,
                payment_remark=mg.payment_remark,
            )
        )
    return output


@router.post("/pay")
def record_payment(
    payment: PaymentRecord,
    db: Session = Depends(get_db),
):
    mg = (
        db.query(MemberGym)
        .filter(
            MemberGym.member_id == payment.member_id,
            MemberGym.gym_id == payment.gym_id,
        )
        .first()
    )
    if not mg:
        raise HTTPException(status_code=404, detail="Membership not found")

    mg.total_owed = max(0.0, float(mg.total_owed) - payment.amount)
    if mg.total_owed <= 0:
        mg.paid = True
    else:
        mg.paid = False
        
    mg.payment_method = payment.payment_method
    if payment.remark:
        mg.payment_remark = payment.remark

    tx = Transactions(
        member_id=payment.member_id,
        gym_id=payment.gym_id,
        amount=payment.amount,
        status="paid",
        paid_by=payment.paid_by,
        payment_method=payment.payment_method,
        date=date.today(),
        plan_name=mg.plan,
        remark=payment.remark,
    )
    db.add(tx)
    db.commit()
    return {"detail": "Payment recorded"}

@router.get("/export")
def export_transactions_csv(
    db: Session = Depends(get_db),
    x_gym_id: Optional[int] = Header(None)
):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")
        
    transactions = (
        db.query(Transactions, Member.name)
        .join(Member, Transactions.member_id == Member.member_id)
        .filter(Transactions.gym_id == x_gym_id)
        .order_by(Transactions.date.desc())
        .all()
    )
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Transaction ID", "Date", "Member Name", "Amount", "Status", 
        "Plan", "Paid By", "Method", "Remark"
    ])
    
    for tx, member_name in transactions:
        writer.writerow([
            tx.transaction_id,
            tx.date,
            member_name,
            float(tx.amount) if tx.amount else 0,
            tx.status,
            tx.plan_name or "",
            tx.paid_by,
            tx.payment_method,
            tx.remark or ""
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=transactions.csv"}
    )

@router.post("/renew-billing")
def renew_billing(
    db: Session = Depends(get_db),
    x_gym_id: Optional[int] = Header(None)
):
    if not x_gym_id:
        raise HTTPException(status_code=400, detail="X-Gym-Id header missing")
        
    active_members = db.query(MemberGym).filter(MemberGym.gym_id == x_gym_id).all()
    count = 0
    today = date.today()
    for mg in active_members:
        if mg.next_billing_date and today >= mg.next_billing_date:
            monthly_cost = float(mg.plan_price) + (float(mg.personal_training_cost) if mg.has_personal_training else 0)
            if monthly_cost > 0:
                mg.total_owed = float(mg.total_owed) + monthly_cost
                mg.paid = False
                
                plan_db = db.query(Plan).filter(Plan.gym_id == x_gym_id, Plan.name == mg.plan).first()
                duration = plan_db.duration_days if plan_db else 30
                
                mg.next_billing_date = mg.next_billing_date + timedelta(days=duration)
                count += 1
            
    db.commit()
    return {"detail": f"Successfully renewed billing for {count} members."}
