from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class TransactionResponse(BaseModel):
    transaction_id: int
    member_id: int
    member_name: str
    gym_id: int
    amount: float
    date: date
    status: str
    plan_name: Optional[str] = None
    paid_by: str
    payment_method: str
    remark: Optional[str] = None

    class Config:
        from_attributes = True


class PaymentRecord(BaseModel):
    member_id: int
    gym_id: int
    amount: float
    payment_method: str = "cash"
    paid_by: str = "cash"
    remark: Optional[str] = None


class ExpenseCreate(BaseModel):
    amount: float
    description: str
    category: str = "other"
    date: Optional[datetime] = None


class ExpenseResponse(BaseModel):
    expense_id: int
    gym_id: int
    amount: float
    description: str
    category: str
    date: date
    created_at: datetime

    class Config:
        from_attributes = True


class MonthlyBreakdown(BaseModel):
    month: str
    income: float
    pt_income: float


class RevenueBySource(BaseModel):
    membership_fees: float = 0
    personal_training: float = 0


class FinanceSummary(BaseModel):
    total_income_ytd: float = 0
    total_expenses: float = 0
    net_income: float = 0
    outstanding_revenue: float = 0
    active_members: int = 0
    monthly_breakdown: list[MonthlyBreakdown] = []
    revenue_by_source: RevenueBySource = RevenueBySource()
    new_signups_this_month: int = 0


class OutstandingMember(BaseModel):
    member_id: int
    member_name: str
    plan: str
    plan_price: float
    has_personal_training: bool
    personal_training_cost: float
    total_owed: float
    payment_method: str
    payment_remark: Optional[str] = None
