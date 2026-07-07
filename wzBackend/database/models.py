from datetime import datetime, date

from sqlalchemy import Integer, String, Boolean, ForeignKey, DateTime, Numeric, Date, Text, UniqueConstraint
from sqlalchemy.orm import mapped_column, Relationship, Mapped
from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    google_id: Mapped[str | None] = mapped_column(String, unique=True, index=True, nullable=True)
    picture: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    owned_gyms: Mapped[list["Gym"]] = Relationship("Gym", back_populates="owner")


class Admin(Base):
    __tablename__ = "admins"

    admin_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)


class Member(Base):
    __tablename__ = "members"

    member_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String)
    phone_number: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)

    gyms: Mapped[list["Gym"]] = Relationship("Gym", secondary="member_gyms", back_populates="members")


class Gym(Base):
    __tablename__ = "gyms"

    gym_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    gym_name: Mapped[str] = mapped_column(String)
    gym_location: Mapped[str] = mapped_column(String)

    members: Mapped[list["Member"]] = Relationship("Member", secondary="member_gyms", back_populates="gyms")
    owner: Mapped["User"] = Relationship("User", back_populates="owned_gyms")
    plans: Mapped[list["Plan"]] = Relationship("Plan", back_populates="gym")
    trainers: Mapped[list["Trainer"]] = Relationship("Trainer", back_populates="gym")


class MemberGym(Base):
    __tablename__ = "member_gyms"

    member_id: Mapped[int] = mapped_column(Integer, ForeignKey("members.member_id"), primary_key=True)
    gym_id: Mapped[int] = mapped_column(Integer, ForeignKey("gyms.gym_id"), primary_key=True)
    joining_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    next_billing_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    plan: Mapped[str] = mapped_column(String)
    plan_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    has_personal_training: Mapped[bool] = mapped_column(Boolean, default=False)
    personal_training_cost: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total_owed: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    paid: Mapped[bool] = mapped_column(Boolean, default=False)
    payment_method: Mapped[str] = mapped_column(String(10), default="cash")
    payment_remark: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Transactions(Base):
    __tablename__ = "transactions"

    transaction_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    member_id: Mapped[int] = mapped_column(Integer, ForeignKey("members.member_id"), index=True)
    gym_id: Mapped[int] = mapped_column(Integer, ForeignKey("gyms.gym_id"), index=True)

    paid_by: Mapped[str] = mapped_column(String)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    date: Mapped[datetime] = mapped_column(Date, default=datetime.now)
    status: Mapped[str] = mapped_column(String(10), default="pending")
    plan_name: Mapped[str | None] = mapped_column(String, nullable=True)
    payment_method: Mapped[str] = mapped_column(String(10), default="cash")
    remark: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Plan(Base):
    __tablename__ = "plans"
    __table_args__ = (UniqueConstraint("gym_id", "name", name="uq_plan_gym_name"),)

    plan_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    gym_id: Mapped[int] = mapped_column(Integer, ForeignKey("gyms.gym_id"), index=True)
    name: Mapped[str] = mapped_column(String(50))
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    duration_days: Mapped[int] = mapped_column(Integer, default=30)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    gym: Mapped["Gym"] = Relationship("Gym", back_populates="plans")


class Expense(Base):
    __tablename__ = "expenses"

    expense_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    gym_id: Mapped[int] = mapped_column(Integer, ForeignKey("gyms.gym_id"), index=True)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    description: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(String(50), default="other")
    date: Mapped[datetime] = mapped_column(Date, default=datetime.now)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


class Trainer(Base):
    __tablename__ = "trainers"

    trainer_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    gym_id: Mapped[int] = mapped_column(Integer, ForeignKey("gyms.gym_id"), index=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    specialization: Mapped[str | None] = mapped_column(String(100), nullable=True)
    charge_per_session: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    gym: Mapped["Gym"] = Relationship("Gym", back_populates="trainers")
