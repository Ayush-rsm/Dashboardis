from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.jwt import create_access_token
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.auth import (
    LoginRequest,
    RefreshRequest,
    TokenResponse,
)
from app.services.auth_service import login_user
from app.services.token_service import get_refresh_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login(
    payload: LoginRequest,
    session: AsyncSession = Depends(get_db),
):
    result = await login_user(
        session,
        payload.email,
        payload.password,
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": "bearer",
    }


@router.post(
    "/refresh",
    response_model=TokenResponse,
)
async def refresh_token(
    payload: RefreshRequest,
    session: AsyncSession = Depends(get_db),
):
    stored_token = await get_refresh_token(
        session,
        payload.refresh_token,
    )

    if stored_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    if stored_token.revoked_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked",
        )

    if stored_token.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired",
        )

    new_access_token = create_access_token(
        str(stored_token.user_id)
    )

    return {
        "access_token": new_access_token,
        "refresh_token": payload.refresh_token,
        "token_type": "bearer",
    }


@router.post("/logout")
async def logout(
    payload: RefreshRequest,
    session: AsyncSession = Depends(get_db),
):
    stored_token = await get_refresh_token(
        session,
        payload.refresh_token,
    )

    if stored_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    stored_token.revoked_at = datetime.now(timezone.utc)

    await session.commit()

    return {
        "message": "Logged out successfully",
    }


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "division_id": current_user.division_id,
        "is_active": current_user.is_active,
    }

