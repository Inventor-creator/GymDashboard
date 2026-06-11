from fastapi import APIRouter, Request, Depends, HTTPException
from starlette.responses import RedirectResponse
from sqlalchemy.orm import Session
from database import models, get_db

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
async def auth_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        print(f"Auth error: {e}")
        return RedirectResponse(url=f"{frontend_url}/login/error?error=auth_failed")

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
            #check for admin
            admin = db.query(models.Admin).filter(models.Admin.email == email).first()
            if admin:
                user = admin
            else:
                return RedirectResponse(url=f"{frontend_url}/login/error?error=userNotFound")
        else:
            # Update user info if it changed
            user.google_id = google_id
            user.full_name = name
            user.picture = picture

        db.commit()
        db.refresh(user)

        # Store user info in session
        request.session['user'] = {
            "id": user.id if type(user) is models.User else user.admin_id,
            "email": user.email,
            "name": user.full_name.split()[0] if user.full_name != None else "not Set" ,
        }


        return RedirectResponse(url=f"{frontend_url}/dashboard")

    return RedirectResponse(url=f"{frontend_url}/login/error?error=no_user_info")

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

@router.get('/users')
async def get_users(request: Request, db: Session = Depends(get_db)):
    user = request.session.get('user')
    if not user or user.get("email") != "aryaupatil9@gmail.com":
        raise HTTPException(status_code=403, detail="Not authorized")

    users = db.query(models.User).all()
    return [{"id": u.id, "email": u.email, "name": u.full_name} for u in users]
