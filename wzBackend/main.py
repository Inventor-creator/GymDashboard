from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from database import models , engine
from authlib.integrations.starlette_client import OAuth
import os
from Routes.authRoutes import router as auth_router
from Routes.memberRoutes import router as member_router
from Routes.userRoutes import router as user_router
from Routes.gymRoutes import router as gym_router
from dotenv import load_dotenv

load_dotenv()

# Create tables (In production, use Alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="WorkoutZone Backend")

# Add Session Middleware
app.add_middleware(SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY") or "",
    session_cookie="secure_session",
    max_age=3600,             # Expire sessions quickly (e.g., 1 hour)
    same_site="lax",          # Protects against Cross-Site Request Forgery (CSRF)
    https_only=False,          # Prevents interception via Man-in-the-Middle (MitM) over HTTP
    domain=None,
)

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(member_router)
app.include_router(gym_router)
app.include_router(user_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to WorkoutZone API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)
