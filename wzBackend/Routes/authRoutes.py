from fastapi import APIRouter, Request, Depends, HTTPException
from starlette.responses import RedirectResponse
from sqlalchemy.orm import Session
from models import models, database
import os
from dotenv import load_dotenv
from authService import oauth

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

@router.get('/login')
async def login(request: Request):
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get('/callback')
async def auth_callback(request: Request, db: Session = Depends(database.get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        print(f"Auth error: {e}")
        return RedirectResponse(url=f"{frontend_url}/login?error=auth_failed")

    user_info = token.get('userinfo')
    if user_info:
        email = user_info.get('email')
        google_id = user_info.get('sub')
        name = user_info.get('name')
        picture = user_info.get('picture')

        # Check if user exists by google_id or email
        user = db.query(models.User).filter(
            (models.User.google_id == google_id) | (models.User.email == email)
        ).first()

        if not user:
            user = models.User(
                email=email,
                google_id=google_id,
                full_name=name,
                picture=picture
            )
            db.add(user)
        else:
            # Update user info if it changed
            user.google_id = google_id
            user.full_name = name
            user.picture = picture

        db.commit()
        db.refresh(user)

        # Store user info in session
        request.session['user'] = {
            "email": user.email,
            "name": user.full_name,
            "picture": user.picture,
            "id": user.id
        }

        return RedirectResponse(url=f"{frontend_url}/dashboard")

    return RedirectResponse(url=f"{frontend_url}/login?error=no_user_info")

@router.get('/logout')
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url=f"{frontend_url}/login")

@router.get('/me')
async def get_me(request: Request):
    user = request.session.get('user')
    if user:
        return user
    raise HTTPException(status_code=401, detail="Not authenticated")
