from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models import Ticket, User
from app.models.ticket_stage_event import StageAction
from app.schemas.ticket import (
    TicketActionRequest,
    TicketCreate,
    TicketHistoryResponse,
    TicketResponse,
    TicketUpdate,
)
from app.services.ticket_service import (
    approve_ticket,
    check_ticket,
    close_ticket,
    create_ticket,
    get_ticket_history,
    submit_ticket,
    update_ticket,
)


router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"],
)


# =========================================================
# CREATE TICKET
# =========================================================

@router.post(
    "",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_ticket_endpoint(
    payload: TicketCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin", "maker")
    ),
):
    try:
        return await create_ticket(
            session=session,
            title=payload.title,
            division_id=payload.division_id,
            type_id=payload.type_id,
            priority=payload.priority,
            maker=current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# =========================================================
# LIST TICKETS
# =========================================================

@router.get(
    "",
    response_model=list[TicketResponse],
)
async def list_tickets(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Ticket)
        .order_by(Ticket.created_at.desc())
    )

    return result.scalars().all()


# =========================================================
# UPDATE TICKET
# =========================================================

@router.patch(
    "/{ticket_id}",
    response_model=TicketResponse,
)
async def update_ticket_endpoint(
    ticket_id: UUID,
    payload: TicketUpdate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin", "maker")
    ),
):
    try:
        return await update_ticket(
            session=session,
            ticket_id=ticket_id,
            title=payload.title,
            priority=payload.priority,
            current_user=current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# =========================================================
# SUBMIT TICKET
# =========================================================

@router.post(
    "/{ticket_id}/submit",
    response_model=TicketResponse,
)
async def submit_ticket_endpoint(
    ticket_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin", "maker")
    ),
):
    try:
        return await submit_ticket(
            session=session,
            ticket_id=ticket_id,
            current_user=current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# =========================================================
# CHECKER ACTION
# =========================================================

@router.post(
    "/{ticket_id}/check",
    response_model=TicketResponse,
)
async def check_ticket_endpoint(
    ticket_id: UUID,
    payload: TicketActionRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin", "checker")
    ),
):
    try:
        return await check_ticket(
            session=session,
            ticket_id=ticket_id,
            action=payload.action,
            remarks=payload.remarks,
            current_user=current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# =========================================================
# APPROVER ACTION
# =========================================================

@router.post(
    "/{ticket_id}/approve",
    response_model=TicketResponse,
)
async def approve_ticket_endpoint(
    ticket_id: UUID,
    payload: TicketActionRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin", "approver")
    ),
):
    try:
        return await approve_ticket(
            session=session,
            ticket_id=ticket_id,
            action=payload.action,
            remarks=payload.remarks,
            current_user=current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# =========================================================
# CLOSE TICKET
# =========================================================

@router.post(
    "/{ticket_id}/close",
    response_model=TicketResponse,
)
async def close_ticket_endpoint(
    ticket_id: UUID,
    payload: TicketActionRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("admin", "approver")
    ),
):
    if payload.action != StageAction.CLOSED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Close action must be 'closed'",
        )

    try:
        return await close_ticket(
            session=session,
            ticket_id=ticket_id,
            remarks=payload.remarks,
            current_user=current_user,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# =========================================================
# TICKET HISTORY
# =========================================================

@router.get(
    "/{ticket_id}/history",
    response_model=list[TicketHistoryResponse],
)
async def ticket_history(
    ticket_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await get_ticket_history(
            session=session,
            ticket_id=ticket_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


# =========================================================
# GET SINGLE TICKET
# =========================================================
# Keep this LAST because /{ticket_id} is a generic path.
# =========================================================

@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
)
async def get_ticket(
    ticket_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        select(Ticket).where(
            Ticket.id == ticket_id
        )
    )

    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    return ticket