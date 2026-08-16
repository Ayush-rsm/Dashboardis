from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models import User

from app.schemas.division import (
    DivisionCreate,
    DivisionResponse,
    DivisionUpdate,
)

from app.services.division_service import (
    create_division,
    get_division,
    list_divisions,
    update_division,
)


router = APIRouter(
    prefix="/divisions",
    tags=["Divisions"],
)


@router.get(
    "",
    response_model=list[DivisionResponse],
)
async def list_divisions_endpoint(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await list_divisions(session)


@router.get(
    "/{division_id}",
    response_model=DivisionResponse,
)
async def get_division_endpoint(
    division_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    division = await get_division(
        session,
        division_id,
    )

    if division is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Division not found",
        )

    return division


@router.post(
    "",
    response_model=DivisionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_division_endpoint(
    payload: DivisionCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    ),
):
    try:
        return await create_division(
            session=session,
            code=payload.code,
            name=payload.name,
            sla_hours=payload.sla_hours,
            is_active=payload.is_active,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.patch(
    "/{division_id}",
    response_model=DivisionResponse,
)
async def update_division_endpoint(
    division_id: int,
    payload: DivisionUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    ),
):
    try:
        return await update_division(
            session=session,
            division_id=division_id,
            code=payload.code,
            name=payload.name,
            sla_hours=payload.sla_hours,
            is_active=payload.is_active,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )