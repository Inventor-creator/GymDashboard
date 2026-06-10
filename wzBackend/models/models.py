from sqlalchemy import Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import mapped_column, Relationship, Mapped
from .database import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(String, nullable=True)
    google_id: Mapped[str | None] = mapped_column(String, unique=True, index=True, nullable=True)
    picture: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Admin(Base):
    __tablename__ = "admins"

    admin_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Member(Base):
    __tablename__ = "members"

    member_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    joining_date: Mapped[str] = mapped_column(String)

    gyms: Mapped[list["Gym"]] = Relationship("Gym", back_populates="members")

class Gym(Base):
    __tablename__ = "gyms"

    gym_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True)
    gym_name: Mapped[str] = mapped_column(String)
    gym_location: Mapped[str] = mapped_column(String)

    members: Mapped[list["Member"]] = Relationship("Member", back_populates="gyms")

class Transactions(Base):
    __tablename__ = "transactions"

    transaction_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    member_id: Mapped[int] = mapped_column(Integer, ForeignKey("members.member_id"), index=True)
    gym_id: Mapped[int] = mapped_column(Integer, ForeignKey("gyms.gym_id"), index=True)
