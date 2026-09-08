from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def run_schema_migrations():
    """Apply lightweight column migrations to already-existing tables."""
    inspector = inspect(engine)
    if "member_gyms" in inspector.get_table_names():
        columns = {c["name"] for c in inspector.get_columns("member_gyms")}
        missing = [
            (name, ddl)
            for name, ddl in [
                ("next_billing_date", "DATE"),
                ("plan_price", "NUMERIC(10, 2) DEFAULT 0"),
                ("has_personal_training", "BOOLEAN DEFAULT false"),
                ("personal_training_cost", "NUMERIC(10, 2) DEFAULT 0"),
                ("assigned_trainer_id", "INTEGER"),
                ("assigned_trainer_at", "DATE"),
                ("assigned_trainer_plan_id", "INTEGER"),
                ("next_trainer_billing_date", "DATE"),
                ("total_owed", "NUMERIC(10, 2) DEFAULT 0"),
                ("paid", "BOOLEAN DEFAULT false"),
                ("payment_method", "VARCHAR(10) DEFAULT 'cash'"),
                ("payment_remark", "TEXT"),
                ("is_active", "BOOLEAN DEFAULT true"),
            ]
            if name not in columns
        ]
        for name, ddl in missing:
            with engine.begin() as conn:
                conn.execute(text(f"ALTER TABLE member_gyms ADD COLUMN {name} {ddl}"))
    if "transactions" in inspector.get_table_names():
        columns = {c["name"] for c in inspector.get_columns("transactions")}
        for name, ddl in [
            ("payment_method", "VARCHAR(10) DEFAULT 'cash'"),
            ("plan_name", "TEXT"),
            ("is_active", "BOOLEAN DEFAULT true"),
        ]:
            if name not in columns:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE transactions ADD COLUMN {name} {ddl}"))
    if "trainer_assignments" in inspector.get_table_names():
        columns = {c["name"] for c in inspector.get_columns("trainer_assignments")}
        if "trainer_plan_id" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE trainer_assignments ADD COLUMN trainer_plan_id INTEGER"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
