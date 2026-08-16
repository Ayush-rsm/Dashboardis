from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models import User

from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserUpdate,
)

from app.services.user_service import (
    create_user,
    get_user,
    list_users,
    update_user,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get(
    "",
    response_model=list[UserResponse],
)
async def list_users_endpoint(
    role: str | None = Query(default=None),
    division_id: int | None = Query(default=None),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await list_users(
            session=session,
            role=role,
            division_id=division_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
)
async def get_user_endpoint(
    user_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = await get_user(
        session,
        user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_user_endpoint(
    payload: UserCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    ),
):
    try:
        return await create_user(
            session=session,
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
            role=payload.role,
            division_id=payload.division_id,
            is_active=payload.is_active,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
)
async def update_user_endpoint(
    user_id: UUID,
    payload: UserUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    ),
):
    try:
        return await update_user(
            session=session,
            user_id=user_id,
            email=payload.email,
            password=payload.password,
            full_name=payload.full_name,
            role=payload.role,
            division_id=payload.division_id,
            is_active=payload.is_active,
        )

    except ValueError as e:
        if str(e) == "User not found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e),
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )