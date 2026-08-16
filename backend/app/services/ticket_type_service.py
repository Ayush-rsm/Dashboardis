from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import TicketType


async def list_ticket_types(
    session: AsyncSession,
):
    result = await session.execute(
        select(TicketType)
        .order_by(TicketType.name)
    )

    return result.scalars().all()


async def get_ticket_type(
    session: AsyncSession,
    type_id: int,
):
    result = await session.execute(
        select(TicketType).where(
            TicketType.id == type_id
        )
    )

    return result.scalar_one_or_none()


async def create_ticket_type(
    session: AsyncSession,
    code: str,
    name: str,
    requires_approver: bool,
):
    existing = await session.execute(
        select(TicketType).where(
            TicketType.code == code
        )
    )

    if existing.scalar_one_or_none() is not None:
        raise ValueError("Ticket type code already exists")

    ticket_type = TicketType(
        code=code,
        name=name,
        requires_approver=requires_approver,
    )

    session.add(ticket_type)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise ValueError("Ticket type code already exists")

    await session.refresh(ticket_type)

    return ticket_type


async def update_ticket_type(
    session: AsyncSession,
    type_id: int,
    code: str | None,
    name: str | None,
    requires_approver: bool | None,
):
    ticket_type = await get_ticket_type(
        session,
        type_id,
    )

    if ticket_type is None:
        raise ValueError("Ticket type not found")

    if code is not None and code != ticket_type.code:
        existing = await session.execute(
            select(TicketType).where(
                TicketType.code == code,
                TicketType.id != type_id,
            )
        )

        if existing.scalar_one_or_none() is not None:
            raise ValueError(
                "Ticket type code already exists"
            )

        ticket_type.code = code

    if name is not None:
        ticket_type.name = name

    if requires_approver is not None:
        ticket_type.requires_approver = (
            requires_approver
        )

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise ValueError("Ticket type update failed")

    await session.refresh(ticket_type)

    return ticket_type