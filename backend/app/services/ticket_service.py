from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Division,
    Ticket,
    TicketPriority,
    TicketStageEvent,
    TicketStatus,
    TicketType,
    StageAction,
    StageName,
    User,
)


async def create_ticket(
    session: AsyncSession,
    title: str,
    division_id: int,
    type_id: int,
    priority: TicketPriority,
    maker: User,
) -> Ticket:

    division_result = await session.execute(
        select(Division).where(
            Division.id == division_id,
            Division.is_active.is_(True),
        )
    )

    division = division_result.scalar_one_or_none()

    if division is None:
        raise ValueError("Division not found or inactive")

    type_result = await session.execute(
        select(TicketType).where(
            TicketType.id == type_id
        )
    )

    ticket_type = type_result.scalar_one_or_none()

    if ticket_type is None:
        raise ValueError("Ticket type not found")

    now = datetime.now(timezone.utc)

    result = await session.execute(
        select(Ticket.reference_no)
        .order_by(Ticket.reference_no.desc())
        .limit(1)
    )

    last_reference = result.scalar_one_or_none()

    if last_reference:
        try:
            last_number = int(last_reference.split("-")[-1])
        except ValueError:
            last_number = 0
    else:
        last_number = 0

    reference_no = f"TKT-{last_number + 1:06d}"

    ticket = Ticket(
        reference_no=reference_no,
        title=title,
        division_id=division_id,
        type_id=type_id,
        status=TicketStatus.OPEN,
        priority=priority,
        maker_id=maker.id,
        created_at=now,
        is_escalated=False,
        sla_breached=False,
        updated_at=now,
    )

    session.add(ticket)

    await session.flush()

    event = TicketStageEvent(
        ticket_id=ticket.id,
        stage=StageName.CREATED,
        action=StageAction.SUBMITTED,
        actor_id=maker.id,
        occurred_at=now,
    )

    session.add(event)

    await session.commit()
    await session.refresh(ticket)

    return ticket


async def update_ticket(
    session: AsyncSession,
    ticket_id: UUID,
    title: str | None,
    priority: TicketPriority | None,
    current_user: User,
) -> Ticket:

    result = await session.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )

    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise ValueError("Ticket not found")

    if ticket.status != TicketStatus.OPEN:
        raise ValueError(
            "Only open tickets can be updated"
        )

    if current_user.role not in {"admin", "maker"}:
        raise ValueError(
            "Only admin or maker can update tickets"
        )

    if current_user.role == "maker":
        if ticket.maker_id != current_user.id:
            raise ValueError(
                "You can only update your own tickets"
            )

    if title is not None:
        ticket.title = title

    if priority is not None:
        ticket.priority = priority

    ticket.updated_at = datetime.now(timezone.utc)

    await session.commit()
    await session.refresh(ticket)

    return ticket


async def submit_ticket(
    session: AsyncSession,
    ticket_id: UUID,
    current_user: User,
) -> Ticket:

    result = await session.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )

    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise ValueError("Ticket not found")

    if ticket.status != TicketStatus.OPEN:
        raise ValueError(
            "Only open tickets can be submitted"
        )

    if current_user.role == "maker":
        if ticket.maker_id != current_user.id:
            raise ValueError(
                "You can only submit your own tickets"
            )

    elif current_user.role != "admin":
        raise ValueError(
            "Only maker or admin can submit tickets"
        )

    now = datetime.now(timezone.utc)

    ticket.status = TicketStatus.PENDING_CHECKER
    ticket.updated_at = now

    event = TicketStageEvent(
        ticket_id=ticket.id,
        stage=StageName.CHECKER,
        action=StageAction.SUBMITTED,
        actor_id=current_user.id,
        occurred_at=now,
    )

    session.add(event)

    await session.commit()
    await session.refresh(ticket)

    return ticket


async def check_ticket(
    session: AsyncSession,
    ticket_id: UUID,
    action: StageAction,
    remarks: str | None,
    current_user: User,
) -> Ticket:

    result = await session.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )

    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise ValueError("Ticket not found")

    if ticket.status != TicketStatus.PENDING_CHECKER:
        raise ValueError(
            "Ticket is not waiting for checker action"
        )

    if action not in {
        StageAction.APPROVED,
        StageAction.REJECTED,
        StageAction.RETURNED,
    }:
        raise ValueError(
            "Checker action must be approved, rejected, or returned"
        )

    if current_user.role == "checker":
        pass
    elif current_user.role == "admin":
        pass
    else:
        raise ValueError(
            "Only checker or admin can perform checker action"
        )

    now = datetime.now(timezone.utc)

    ticket.checker_id = current_user.id
    ticket.checker_action_at = now
    ticket.updated_at = now

    if action == StageAction.REJECTED:
        ticket.status = TicketStatus.REJECTED
        ticket.closed_at = now

    elif action == StageAction.RETURNED:
        ticket.status = TicketStatus.OPEN

    elif action == StageAction.APPROVED:

        type_result = await session.execute(
            select(TicketType).where(
                TicketType.id == ticket.type_id
            )
        )

        ticket_type = type_result.scalar_one_or_none()

        if ticket_type is None:
            raise ValueError("Ticket type not found")

        if ticket_type.requires_approver:
            ticket.status = TicketStatus.PENDING_APPROVER
        else:
            ticket.status = TicketStatus.APPROVED

    event = TicketStageEvent(
        ticket_id=ticket.id,
        stage=StageName.CHECKER,
        action=action,
        actor_id=current_user.id,
        remarks=remarks,
        occurred_at=now,
    )

    session.add(event)

    if ticket.checker_action_at:
        cycle_seconds = (
            ticket.checker_action_at - ticket.created_at
        ).total_seconds()

        ticket.checker_cycle_hours = round(
            cycle_seconds / 3600,
            2,
        )

    await session.commit()
    await session.refresh(ticket)

    return ticket


async def approve_ticket(
    session: AsyncSession,
    ticket_id: UUID,
    action: StageAction,
    remarks: str | None,
    current_user: User,
) -> Ticket:

    result = await session.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )

    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise ValueError("Ticket not found")

    if ticket.status != TicketStatus.PENDING_APPROVER:
        raise ValueError(
            "Ticket is not waiting for approver action"
        )

    if action not in {
        StageAction.APPROVED,
        StageAction.REJECTED,
        StageAction.RETURNED,
    }:
        raise ValueError(
            "Approver action must be approved, rejected, or returned"
        )

    if current_user.role not in {"approver", "admin"}:
        raise ValueError(
            "Only approver or admin can perform approval action"
        )

    now = datetime.now(timezone.utc)

    ticket.approver_id = current_user.id
    ticket.approver_action_at = now
    ticket.updated_at = now

    if action == StageAction.APPROVED:
        ticket.status = TicketStatus.APPROVED

    elif action == StageAction.REJECTED:
        ticket.status = TicketStatus.REJECTED
        ticket.closed_at = now

    elif action == StageAction.RETURNED:
        ticket.status = TicketStatus.OPEN

    event = TicketStageEvent(
        ticket_id=ticket.id,
        stage=StageName.APPROVER,
        action=action,
        actor_id=current_user.id,
        remarks=remarks,
        occurred_at=now,
    )

    session.add(event)

    if ticket.approver_action_at and ticket.checker_action_at:
        cycle_seconds = (
            ticket.approver_action_at
            - ticket.checker_action_at
        ).total_seconds()

        ticket.approval_cycle_hours = round(
            cycle_seconds / 3600,
            2,
        )

    if ticket.approver_action_at:
        total_seconds = (
            ticket.approver_action_at
            - ticket.created_at
        ).total_seconds()

        ticket.total_cycle_hours = round(
            total_seconds / 3600,
            2,
        )

    await session.commit()
    await session.refresh(ticket)

    return ticket


async def close_ticket(
    session: AsyncSession,
    ticket_id: UUID,
    remarks: str | None,
    current_user: User,
) -> Ticket:

    result = await session.execute(
        select(Ticket).where(Ticket.id == ticket_id)
    )

    ticket = result.scalar_one_or_none()

    if ticket is None:
        raise ValueError("Ticket not found")

    if ticket.status != TicketStatus.APPROVED:
        raise ValueError(
            "Only approved tickets can be closed"
        )

    if current_user.role not in {
        "admin",
        "approver",
    }:
        raise ValueError(
            "Only approver or admin can close tickets"
        )

    now = datetime.now(timezone.utc)

    ticket.status = TicketStatus.CLOSED
    ticket.closed_at = now
    ticket.updated_at = now

    if ticket.total_cycle_hours is None:
        total_seconds = (
            now - ticket.created_at
        ).total_seconds()

        ticket.total_cycle_hours = round(
            total_seconds / 3600,
            2,
        )

    event = TicketStageEvent(
        ticket_id=ticket.id,
        stage=StageName.CLOSURE,
        action=StageAction.CLOSED,
        actor_id=current_user.id,
        remarks=remarks,
        occurred_at=now,
    )

    session.add(event)

    await session.commit()
    await session.refresh(ticket)

    return ticket


async def get_ticket_history(
    session: AsyncSession,
    ticket_id: UUID,
) -> list[TicketStageEvent]:

    ticket_result = await session.execute(
        select(Ticket.id).where(
            Ticket.id == ticket_id
        )
    )

    ticket_exists = ticket_result.scalar_one_or_none()

    if ticket_exists is None:
        raise ValueError("Ticket not found")

    result = await session.execute(
        select(TicketStageEvent)
        .where(
            TicketStageEvent.ticket_id == ticket_id
        )
        .order_by(
            TicketStageEvent.occurred_at.asc()
        )
    )

    return list(result.scalars().all())