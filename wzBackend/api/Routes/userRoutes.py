from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.models import User
router = APIRouter(prefix="/users")

@router.get("/")
def get_users(db: Session = Depends()):
    users = db.query(User).all()
    return users
