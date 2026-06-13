from datetime import timedelta, datetime

from pydantic_core.core_schema import computed_field
from sqlalchemy import Integer, String, Boolean, ForeignKey , DateTime
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
    joining_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    plan: Mapped[str] = mapped_column(String)
    phone_number: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)

    gyms: Mapped[list["Gym"]] = Relationship("Gym", secondary="member_gyms", back_populates="members")

    @property
    def end_date(self) -> datetime:
        #plans: monthly, quarterly, half yearly, yearly
        if self.plan == "monthly":
            return self.joining_date + timedelta(days=30)
        elif self.plan == "quarterly":
            return self.joining_date + timedelta(days=90)
        elif self.plan == "half yearly":
            return self.joining_date + timedelta(days=180)
        elif self.plan == "yearly":
            return self.joining_date + timedelta(days=365)
        else:
            return self.joining_date


class MemberGym(Base):
    __tablename__ = "member_gyms"

    member_id: Mapped[int] = mapped_column(Integer, ForeignKey("members.member_id"), primary_key=True)
    gym_id: Mapped[int] = mapped_column(Integer, ForeignKey("gyms.gym_id"), primary_key=True)

class Gym(Base):
    __tablename__ = "gyms"

    gym_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    gym_name: Mapped[str] = mapped_column(String)
    gym_location: Mapped[str] = mapped_column(String)

    members: Mapped[list["Member"]] = Relationship("Member", secondary="member_gyms", back_populates="gyms")
    owner: Mapped["User"] = Relationship("User", back_populates="owned_gyms")



class Transactions(Base):
    __tablename__ = "transactions"

    transaction_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    member_id: Mapped[int] = mapped_column(Integer, ForeignKey("members.member_id"), index=True)
    gym_id: Mapped[int] = mapped_column(Integer, ForeignKey("gyms.gym_id"), index=True)

    paid_by: Mapped[str] = mapped_column(String) #cash or card
