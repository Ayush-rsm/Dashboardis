from app.core.security import hash_password

import argparse
import asyncio
import random
from datetime import timedelta
from decimal import Decimal

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.db.session import engine

from app.models import (
    Division,
    TicketType,
    User,
    Ticket,
    TicketStatus,
    TicketPriority,
    TicketStageEvent,
    StageName,
    StageAction,
    Escalation,
    EscalationLevel,
    EscalationReason,
    EscalationStatus,
)

from app.seed.generators import (
    DIVISIONS,
    TICKET_TYPES,
    FIRST_NAMES,
    TICKET_TITLES,
    utc_now,
    weighted_status,
    weighted_priority,
    random_weekday_datetime,
    lognormal_hours,
    make_reference_no,
    make_user_email,
)


SEED = 42

async_session = async_sessionmaker(
    engine,
    expire_on_commit=False,
)


# =========================================================
# DATABASE RESET
# =========================================================

async def clear_database(
    session: AsyncSession,
) -> None:

    await session.execute(
        text(
            """
            TRUNCATE TABLE
                refresh_tokens,
                escalations,
                ticket_stage_events,
                tickets,
                users,
                ticket_types,
                divisions
            RESTART IDENTITY CASCADE
            """
        )
    )

    await session.commit()


# =========================================================
# REFERENCE DATA
# =========================================================

async def seed_reference_data(
    session: AsyncSession,
):

    divisions = [
        Division(
            code=item["code"],
            name=item["name"],
            sla_hours=item["sla_hours"],
            is_active=True,
        )
        for item in DIVISIONS
    ]

    ticket_types = [
        TicketType(
            code=item["code"],
            name=item["name"],
            requires_approver=item["requires_approver"],
        )
        for item in TICKET_TYPES
    ]

    session.add_all(divisions)
    session.add_all(ticket_types)

    await session.flush()

    return divisions, ticket_types


# =========================================================
# USERS
# =========================================================

async def seed_users(
    session: AsyncSession,
    divisions: list[Division],
):

    users = []

    roles = [
        "admin",
        "approver",
        "checker",
        "maker",
        "viewer",
    ]

    for index, first_name in enumerate(
        FIRST_NAMES,
        start=1,
    ):

        role = roles[
            (index - 1) % len(roles)
        ]

        division = None

        if role != "admin":
            division = divisions[
                (index - 1) % len(divisions)
            ]

        user = User(
            email=make_user_email(
                first_name,
                index,
            ),
            password_hash=hash_password(
                "Admin@123"
            ),
            full_name=first_name,
            role=role,
            division_id=(
                division.id
                if division
                else None
            ),
            is_active=True,
        )

        users.append(user)

    # Development admin
    users[0].email = "admin@example.com"
    users[0].full_name = "Ayush Chaudhary"

    session.add_all(users)

    await session.flush()

    return users


# =========================================================
# USER SELECTION
# =========================================================

def choose_user(
    rng: random.Random,
    users: list[User],
    role: str,
    division_id,
) -> User:

    candidates = [
        user
        for user in users
        if user.role == role
        and (
            user.division_id == division_id
            or user.role == "admin"
        )
    ]

    if not candidates:

        candidates = [
            user
            for user in users
            if user.role == role
        ]

    return rng.choice(candidates)


# =========================================================
# SAFE TIMESTAMP
# =========================================================

def ensure_not_future(
    value,
    now,
):
    if value > now:
        return (
            now
            - timedelta(
                minutes=random.randint(
                    1,
                    300,
                )
            )
        )

    return value


# =========================================================
# TICKET SEEDING
# =========================================================

async def seed_tickets(
    session: AsyncSession,
    users: list[User],
    divisions: list[Division],
    ticket_types: list[TicketType],
    ticket_count: int,
    rng: random.Random,
):

    now = utc_now()

    start = (
        now
        - timedelta(days=365)
    )

    tickets = []
    event_rows = []
    escalation_rows = []

    # =====================================================
    # CREATE TICKETS
    # =====================================================

    for index in range(
        1,
        ticket_count + 1,
    ):

        # -------------------------------------------------
        # DIVISION
        # -------------------------------------------------

        division = rng.choices(
            divisions,
            weights=[
                23,  # IT
                22,  # Finance
                18,  # Operations
                15,  # HR
                7,   # Legal
                15,  # Procurement
            ],
            k=1,
        )[0]

        # -------------------------------------------------
        # TICKET TYPE
        # -------------------------------------------------

        ticket_type = rng.choice(
            ticket_types
        )

        # -------------------------------------------------
        # MAKER
        # -------------------------------------------------

        maker = choose_user(
            rng,
            users,
            "maker",
            division.id,
        )

        # -------------------------------------------------
        # CHECKER
        # -------------------------------------------------

        checker = choose_user(
            rng,
            users,
            "checker",
            division.id,
        )

        if checker.id == maker.id:

            checker = next(
                user
                for user in users
                if user.role == "checker"
                and user.id != maker.id
            )

        # -------------------------------------------------
        # APPROVER
        # -------------------------------------------------

        approver = None

        if ticket_type.requires_approver:

            approver = choose_user(
                rng,
                users,
                "approver",
                division.id,
            )

        # -------------------------------------------------
        # STATUS
        # -------------------------------------------------

        status_value = weighted_status(
            rng
        )

        priority_value = weighted_priority(
            rng
        )

        # -------------------------------------------------
        # CREATED
        # -------------------------------------------------

        created_at = random_weekday_datetime(
            rng,
            start,
            now,
        )

        # -------------------------------------------------
        # WORKFLOW DURATIONS
        # -------------------------------------------------

        cycle_hours = lognormal_hours(
            rng,
            division.code,
        )

        checker_hours = (
            cycle_hours
            * rng.uniform(
                0.25,
                0.45,
            )
        )

        approval_hours = (
            cycle_hours
            * rng.uniform(
                0.25,
                0.55,
            )
        )

        # -------------------------------------------------
        # CHECKER ACTION
        # -------------------------------------------------

        checker_action_at = None

        if status_value not in {
            "pending_checker",
        }:

            checker_action_at = (
                created_at
                + timedelta(
                    hours=checker_hours
                )
            )

            checker_action_at = ensure_not_future(
                checker_action_at,
                now,
            )

        # -------------------------------------------------
        # APPROVER ACTION
        # -------------------------------------------------

        approver_action_at = None

        if (
            approver
            and status_value
            not in {
                "pending_checker",
                "pending_approver",
            }
        ):

            approver_action_at = (
                checker_action_at
                + timedelta(
                    hours=approval_hours
                )
            )

            approver_action_at = ensure_not_future(
                approver_action_at,
                now,
            )

        # -------------------------------------------------
        # CLOSED AT
        # -------------------------------------------------

        closed_at = None

        if status_value in {
            "closed",
            "rejected",
            "cancelled",
        }:

            closure_base = (
                approver_action_at
                or checker_action_at
                or created_at
            )

            closed_at = (
                closure_base
                + timedelta(
                    hours=rng.uniform(
                        1,
                        24,
                    )
                )
            )

            closed_at = ensure_not_future(
                closed_at,
                now,
            )

        # -------------------------------------------------
        # TOTAL CYCLE
        # -------------------------------------------------

        total_cycle_hours = None

        if status_value not in {
            "pending_checker",
            "pending_approver",
        }:

            effective_end = (
                closed_at
                or approver_action_at
                or checker_action_at
                or now
            )

            total_cycle_hours = (
                effective_end
                - created_at
            ).total_seconds() / 3600

            total_cycle_hours = max(
                total_cycle_hours,
                0.1,
            )

        # -------------------------------------------------
        # TICKET
        # -------------------------------------------------

        ticket = Ticket(
            reference_no=make_reference_no(
                index
            ),

            title=rng.choice(
                TICKET_TITLES
            ),

            division_id=division.id,

            type_id=ticket_type.id,

            status=TicketStatus(
                status_value
            ),

            priority=TicketPriority(
                priority_value
            ),

            maker_id=maker.id,

            checker_id=checker.id,

            approver_id=(
                approver.id
                if approver
                else None
            ),

            created_at=created_at,

            checker_action_at=(
                checker_action_at
            ),

            approver_action_at=(
                approver_action_at
            ),

            closed_at=closed_at,

            checker_cycle_hours=(
                Decimal(
                    str(
                        round(
                            checker_hours,
                            2,
                        )
                    )
                )
                if checker_action_at
                else None
            ),

            approval_cycle_hours=(
                Decimal(
                    str(
                        round(
                            approval_hours,
                            2,
                        )
                    )
                )
                if approver_action_at
                else None
            ),

            total_cycle_hours=(
                Decimal(
                    str(
                        round(
                            total_cycle_hours,
                            2,
                        )
                    )
                )
                if total_cycle_hours is not None
                else None
            ),

            is_escalated=False,

            sla_breached=False,
        )

        # -------------------------------------------------
        # SLA
        # -------------------------------------------------

        effective_end = (
            closed_at
            or now
        )

        total_hours = (
            effective_end
            - created_at
        ).total_seconds() / 3600

        ticket.sla_breached = (
            total_hours
            > division.sla_hours
        )

        tickets.append(ticket)

    # =====================================================
    # FLUSH
    # =====================================================

    session.add_all(tickets)

    await session.flush()

    # =====================================================
    # STAGE EVENTS
    # =====================================================

    for ticket in tickets:

        events = []

        # -------------------------------------------------
        # CREATED
        # -------------------------------------------------

        events.append(
            TicketStageEvent(
                ticket_id=ticket.id,
                stage=StageName.CREATED,
                action=StageAction.SUBMITTED,
                actor_id=ticket.maker_id,
                occurred_at=ticket.created_at,
            )
        )

        # -------------------------------------------------
        # SEND BACK
        # -------------------------------------------------

        # Send-back only makes sense when checker
        # actually acted on the ticket.
        if (
            ticket.checker_action_at
            and ticket.status
            not in {
                TicketStatus.CANCELLED,
            }
            and rng.random() < 0.15
        ):

            checker_window = (
                ticket.checker_action_at
                - ticket.created_at
            ).total_seconds()

            return_offset = (
                checker_window
                * rng.uniform(
                    0.35,
                    0.75,
                )
            )

            send_back_at = (
                ticket.created_at
                + timedelta(
                    seconds=return_offset
                )
            )

            # RETURNED
            events.append(
                TicketStageEvent(
                    ticket_id=ticket.id,
                    stage=StageName.CHECKER,
                    action=StageAction.RETURNED,
                    actor_id=ticket.checker_id,
                    occurred_at=send_back_at,
                    remarks=(
                        "Returned to maker "
                        "for additional information"
                    ),
                )
            )

            # RESUBMISSION
            resubmission_delay = rng.uniform(
                2,
                24,
            )

            resubmitted_at = (
                send_back_at
                + timedelta(
                    hours=resubmission_delay
                )
            )

            # Keep resubmission before checker action.
            if (
                resubmitted_at
                >= ticket.checker_action_at
            ):

                available_seconds = (
                    ticket.checker_action_at
                    - send_back_at
                ).total_seconds()

                if available_seconds > 0:

                    resubmitted_at = (
                        send_back_at
                        + timedelta(
                            seconds=(
                                available_seconds
                                * 0.5
                            )
                        )
                    )

            if (
                resubmitted_at
                < ticket.checker_action_at
            ):

                events.append(
                    TicketStageEvent(
                        ticket_id=ticket.id,
                        stage=StageName.CREATED,
                        action=StageAction.SUBMITTED,
                        actor_id=ticket.maker_id,
                        occurred_at=resubmitted_at,
                        remarks=(
                            "Maker resubmitted "
                            "after send-back"
                        ),
                    )
                )

        # -------------------------------------------------
        # CHECKER
        # -------------------------------------------------

        if ticket.checker_action_at:

            checker_action = (
                StageAction.REJECTED
                if (
                    ticket.status
                    == TicketStatus.REJECTED
                )
                else StageAction.APPROVED
            )

            events.append(
                TicketStageEvent(
                    ticket_id=ticket.id,
                    stage=StageName.CHECKER,
                    action=checker_action,
                    actor_id=ticket.checker_id,
                    occurred_at=ticket.checker_action_at,
                )
            )

        # -------------------------------------------------
        # APPROVER
        # -------------------------------------------------

        if (
            ticket.approver_id
            and ticket.approver_action_at
        ):

            approver_action = (
                StageAction.REJECTED
                if (
                    ticket.status
                    == TicketStatus.REJECTED
                )
                else StageAction.APPROVED
            )

            events.append(
                TicketStageEvent(
                    ticket_id=ticket.id,
                    stage=StageName.APPROVER,
                    action=approver_action,
                    actor_id=ticket.approver_id,
                    occurred_at=ticket.approver_action_at,
                )
            )

        # -------------------------------------------------
        # CLOSURE
        # -------------------------------------------------

        if ticket.closed_at:

            closure_action = (
                StageAction.REJECTED
                if (
                    ticket.status
                    == TicketStatus.REJECTED
                )
                else StageAction.CLOSED
            )

            closure_actor = (
                ticket.approver_id
                or ticket.checker_id
                or ticket.maker_id
            )

            events.append(
                TicketStageEvent(
                    ticket_id=ticket.id,
                    stage=StageName.CLOSURE,
                    action=closure_action,
                    actor_id=closure_actor,
                    occurred_at=ticket.closed_at,
                )
            )

        # -------------------------------------------------
        # SORT EVENTS
        # -------------------------------------------------

        events.sort(
            key=lambda event: event.occurred_at
        )

        event_rows.extend(events)

    # =====================================================
    # INSERT STAGE EVENTS
    # =====================================================

    session.add_all(event_rows)

    await session.flush()

    # =====================================================
    # ESCALATIONS
    # =====================================================

    escalation_count = round(
        len(tickets) * 0.18
    )

    # Long-cycle tickets are more likely
    # to be escalated.
    sorted_tickets = sorted(
        tickets,
        key=lambda ticket: float(
            ticket.total_cycle_hours
            or 0
        ),
        reverse=True,
    )

    escalation_candidates = (
        sorted_tickets[
            :min(
                len(sorted_tickets),
                escalation_count * 2,
            )
        ]
    )

    escalation_tickets = []

    if escalation_candidates:

        escalation_tickets = rng.sample(
            escalation_candidates,
            min(
                escalation_count,
                len(escalation_candidates),
            ),
        )

    # =====================================================
    # CREATE ESCALATIONS
    # =====================================================

    for ticket in escalation_tickets:

        level = rng.choices(
            [
                EscalationLevel.L1,
                EscalationLevel.L2,
                EscalationLevel.L3,
            ],
            weights=[
                60,
                30,
                10,
            ],
            k=1,
        )[0]

        reason = rng.choice(
            list(EscalationReason)
        )

        resolved = (
            rng.random()
            < 0.70
        )

        status = (
            EscalationStatus.RESOLVED
            if resolved
            else EscalationStatus.OPEN
        )

        # -------------------------------------------------
        # RAISED
        # -------------------------------------------------

        ticket_total_hours = float(
            ticket.total_cycle_hours
            or 24
        )

        raised_at = (
            ticket.created_at
            + timedelta(
                hours=min(
                    ticket_total_hours / 2,
                    48,
                )
            )
        )

        raised_at = ensure_not_future(
            raised_at,
            now,
        )

        # -------------------------------------------------
        # RESOLUTION
        # -------------------------------------------------

        resolution_date = None
        resolution_hours = None

        if resolved:

            resolution_hours_value = rng.uniform(
                2,
                48,
            )

            resolution_date = (
                raised_at
                + timedelta(
                    hours=resolution_hours_value
                )
            )

            resolution_date = ensure_not_future(
                resolution_date,
                now,
            )

            actual_hours = (
                resolution_date
                - raised_at
            ).total_seconds() / 3600

            resolution_hours = Decimal(
                str(
                    round(
                        max(
                            actual_hours,
                            0.1,
                        ),
                        2,
                    )
                )
            )

        # -------------------------------------------------
        # ESCALATION
        # -------------------------------------------------

        escalation = Escalation(
            ticket_id=ticket.id,

            level=level,

            reason=reason,

            reason_detail=(
                f"Seeded escalation for "
                f"{ticket.reference_no}"
            ),

            status=status,

            raised_by_id=ticket.maker_id,

            resolved_by_id=(
                ticket.approver_id
                if resolved
                else None
            ),

            raised_at=raised_at,

            resolution_date=resolution_date,

            resolution_hours=resolution_hours,
        )

        escalation_rows.append(
            escalation
        )

        ticket.is_escalated = True

    # =====================================================
    # INSERT ESCALATIONS
    # =====================================================

    session.add_all(
        escalation_rows
    )

    await session.flush()

    return tickets


# =========================================================
# SEED DATABASE
# =========================================================

async def seed_database(
    ticket_count: int,
):

    rng = random.Random(
        SEED
    )

    async with async_session() as session:

        print(
            "Resetting development database..."
        )

        await clear_database(
            session
        )

        print(
            "Creating reference data..."
        )

        divisions, ticket_types = (
            await seed_reference_data(
                session
            )
        )

        print(
            "Creating users..."
        )

        users = await seed_users(
            session,
            divisions,
        )

        print(
            f"Creating {ticket_count} tickets..."
        )

        tickets = await seed_tickets(
            session,
            users,
            divisions,
            ticket_types,
            ticket_count,
            rng,
        )

        await session.commit()

        # =================================================
        # SUMMARY
        # =================================================

        print()
        print(
            "=========================================="
        )
        print(
            "Seed completed successfully."
        )
        print(
            "=========================================="
        )

        print(
            f"Divisions:    {len(divisions)}"
        )

        print(
            f"Ticket types: {len(ticket_types)}"
        )

        print(
            f"Users:        {len(users)}"
        )

        print(
            f"Tickets:      {len(tickets)}"
        )

        print()
        print(
            "Development login:"
        )

        print(
            "admin@example.com / Admin@123"
        )

        print(
            "=========================================="
        )


# =========================================================
# CLI
# =========================================================

def parse_args():

    parser = argparse.ArgumentParser(
        description=(
            "Seed development database."
        )
    )

    parser.add_argument(
        "--tickets",
        type=int,
        default=500,
    )

    return parser.parse_args()


# =========================================================
# ENTRY POINT
# =========================================================

def main():

    args = parse_args()

    asyncio.run(
        seed_database(
            args.tickets
        )
    )


if __name__ == "__main__":
    main()