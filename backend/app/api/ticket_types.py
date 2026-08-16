from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models import User

from app.schemas.ticket_type import (
    TicketTypeCreate,
    TicketTypeResponse,
    TicketTypeUpdate,
)

from app.services.ticket_type_service import (
    create_ticket_type,
    get_ticket_type,
    list_ticket_types,
    update_ticket_type,
)


router = APIRouter(
    prefix="/ticket-types",
    tags=["Ticket Types"],
)


@router.get(
    "",
    response_model=list[TicketTypeResponse],
)
async def list_ticket_types_endpoint(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await list_ticket_types(session)


@router.get(
    "/{type_id}",
    response_model=TicketTypeResponse,
)
async def get_ticket_type_endpoint(
    type_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket_type = await get_ticket_type(
        session,
        type_id,
    )

    if ticket_type is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket type not found",
        )

    return ticket_type


@router.post(
    "",
    response_model=TicketTypeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_ticket_type_endpoint(
    payload: TicketTypeCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    ),
):
    try:
        return await create_ticket_type(
            session=session,
            code=payload.code,
            name=payload.name,
            requires_approver=payload.requires_approver,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.patch(
    "/{type_id}",
    response_model=TicketTypeResponse,
)
async def update_ticket_type_endpoint(
    type_id: int,
    payload: TicketTypeUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin")
    ),
):
    try:
        return await update_ticket_type(
            session=session,
            type_id=type_id,
            code=payload.code,
            name=payload.name,
            requires_approver=payload.requires_approver,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )