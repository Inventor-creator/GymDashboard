from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import  UserSchemas
from models import models
import database

# Create tables (In production, use Alembic)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="WorkoutZone Backend")

@app.get("/")
def read_root():
    return {"message": "Welcome to WorkoutZone API"}
