from sqlalchemy import text, func, select, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    Division,
    Ticket,
    TicketStatus,
    TicketType,
    TicketStageEvent,
    StageAction,
    StageName,
    Escalation,
    EscalationLevel,
    User,
)


# =========================================================
# CONSTANTS
# =========================================================

DEPARTMENT_MAPPING = {
    "L&D - Strategy": ["HR"],
    "Customer Quality Ops": ["OPS"],
    "Brand - Strategy": ["IT"],
    "Process QC - Strategy": ["LEGAL"],
    "Supply Chain - Ops": ["PROC"],
    "HR - Admin": ["HR"],
    "Finance - Planning": ["FIN"],
    "Mfg - Quality": ["OPS"],
}


CHECKER_LEVELS = {
    "L1": 0,
    "L2": 1,
    "L3": 2,
}


# =========================================================
# OVERVIEW
# =========================================================

async def get_overview(
    session: AsyncSession,
):
    result = await session.execute(
        select(
            func.count(Ticket.id).label("total"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.OPEN
            )
            .label("open"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.PENDING_CHECKER
            )
            .label("pending_checker"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.PENDING_APPROVER
            )
            .label("pending_approver"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.APPROVED
            )
            .label("approved"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.REJECTED
            )
            .label("rejected"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.CLOSED
            )
            .label("closed"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.CANCELLED
            )
            .label("cancelled"),

            func.count(Ticket.id)
            .filter(
                Ticket.is_escalated.is_(True)
            )
            .label("escalated"),

            func.count(Ticket.id)
            .filter(
                Ticket.sla_breached.is_(True)
            )
            .label("sla_breached"),
        )
    )

    row = result.one()

    return {
        "total_tickets": int(row.total),
        "open_tickets": int(row.open),
        "pending_checker": int(row.pending_checker),
        "pending_approver": int(row.pending_approver),
        "approved_tickets": int(row.approved),
        "rejected_tickets": int(row.rejected),
        "closed_tickets": int(row.closed),
        "cancelled_tickets": int(row.cancelled),
        "escalated_tickets": int(row.escalated),
        "sla_breached_tickets": int(row.sla_breached),
    }


# =========================================================
# STATUS ANALYTICS
# =========================================================

async def get_status_analytics(
    session: AsyncSession,
):
    result = await session.execute(
        select(
            Ticket.status,
            func.count(Ticket.id).label("count"),
        )
        .group_by(Ticket.status)
        .order_by(Ticket.status)
    )

    return [
        {
            "status": row.status.value,
            "count": int(row.count),
        }
        for row in result.all()
    ]


# =========================================================
# DIVISION ANALYTICS
# =========================================================

async def get_division_analytics(
    session: AsyncSession,
):
    result = await session.execute(
        select(
            Division.id,
            Division.code,
            Division.name,
            func.count(Ticket.id).label("ticket_count"),
        )
        .outerjoin(
            Ticket,
            Ticket.division_id == Division.id,
        )
        .group_by(
            Division.id,
            Division.code,
            Division.name,
        )
        .order_by(Division.name)
    )

    return [
        {
            "division_id": row.id,
            "division_code": row.code,
            "division_name": row.name,
            "ticket_count": int(row.ticket_count),
        }
        for row in result.all()
    ]


# =========================================================
# TICKET TYPE ANALYTICS
# =========================================================

async def get_ticket_type_analytics(
    session: AsyncSession,
):
    result = await session.execute(
        select(
            TicketType.id,
            TicketType.code,
            TicketType.name,
            func.count(Ticket.id).label("ticket_count"),
        )
        .outerjoin(
            Ticket,
            Ticket.type_id == TicketType.id,
        )
        .group_by(
            TicketType.id,
            TicketType.code,
            TicketType.name,
        )
        .order_by(TicketType.name)
    )

    return [
        {
            "type_id": row.id,
            "type_code": row.code,
            "type_name": row.name,
            "ticket_count": int(row.ticket_count),
        }
        for row in result.all()
    ]


# =========================================================
# APPROVAL TIME ANALYTICS
# =========================================================

async def get_approval_time_analytics(
    session: AsyncSession,
):
    result = await session.execute(
        select(
            func.avg(
                Ticket.checker_cycle_hours
            ).label("average_checker_hours"),

            func.avg(
                Ticket.approval_cycle_hours
            ).label("average_approval_hours"),

            func.avg(
                Ticket.total_cycle_hours
            ).label("average_total_hours"),
        )
    )

    row = result.one()

    return {
        "average_checker_hours": float(
            row.average_checker_hours or 0
        ),
        "average_approval_hours": float(
            row.average_approval_hours or 0
        ),
        "average_total_hours": float(
            row.average_total_hours or 0
        ),
    }


# =========================================================
# OPERATIONAL SUMMARY
# =========================================================

async def get_operational_analytics(
    session: AsyncSession,
):
    result = await session.execute(
        select(
            func.count(Ticket.id).label("total"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.OPEN
            )
            .label("open"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.PENDING_CHECKER
            )
            .label("pending_checker"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.PENDING_APPROVER
            )
            .label("pending_approver"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.APPROVED
            )
            .label("approved"),

            func.count(Ticket.id)
            .filter(
                Ticket.status == TicketStatus.CLOSED
            )
            .label("closed"),

            func.count(Ticket.id)
            .filter(
                Ticket.is_escalated.is_(True)
            )
            .label("escalated"),

            func.count(Ticket.id)
            .filter(
                Ticket.sla_breached.is_(True)
            )
            .label("sla_breached"),
        )
    )

    row = result.one()

    return {
        "total_tickets": int(row.total),
        "open_tickets": int(row.open),
        "pending_checker": int(row.pending_checker),
        "pending_approver": int(row.pending_approver),
        "approved_tickets": int(row.approved),
        "closed_tickets": int(row.closed),
        "escalated": int(row.escalated),
        "sla_breached": int(row.sla_breached),
    }


# =========================================================
# DECISION MATRIX
# =========================================================

async def get_decision_matrix(
    session: AsyncSession,
):
    result = await session.execute(
        select(
            Ticket.status,
            func.count(Ticket.id).label("count"),
        )
        .group_by(Ticket.status)
        .order_by(Ticket.status)
    )

    return [
        {
            "status": row.status.value,
            "count": int(row.count),
        }
        for row in result.all()
    ]


# =========================================================
# APPROVAL TIME TREND
# =========================================================

async def get_approval_time_trend(
    session: AsyncSession,
):
    result = await session.execute(
        text(
            """
            SELECT
                DATE_TRUNC(
                    'month',
                    closed_at
                ) AS month_date,

                TO_CHAR(
                    DATE_TRUNC(
                        'month',
                        closed_at
                    ),
                    'Mon YYYY'
                ) AS month,

                ROUND(
                    AVG(
                        EXTRACT(
                            EPOCH FROM (
                                closed_at - created_at
                            )
                        ) / 86400
                    )::numeric,
                    1
                ) AS average_days

            FROM tickets

            WHERE closed_at IS NOT NULL

            GROUP BY DATE_TRUNC(
                'month',
                closed_at
            )

            ORDER BY month_date
            """
        )
    )

    rows = result.mappings().all()

    return [
        {
            "month": row["month"],
            "average_days": float(
                row["average_days"] or 0
            ),
        }
        for row in rows
    ]


# =========================================================
# OPEN TICKET AGING
# =========================================================

async def get_open_ticket_aging(
    session: AsyncSession,
):
    age_days = (
        func.extract(
            "epoch",
            func.current_timestamp() - Ticket.created_at,
        )
        / 86400
    )

    age_bucket = case(
        (age_days <= 7, "0-7"),
        (age_days <= 15, "8-15"),
        (age_days <= 30, "16-30"),
        (age_days <= 60, "31-60"),
        else_=">60",
    )

    result = await session.execute(
        select(
            age_bucket.label("age_bucket"),
            func.count(Ticket.id).label("count"),
        )
        .where(
            Ticket.status == TicketStatus.OPEN
        )
        .group_by(age_bucket)
    )

    rows = result.all()

    counts = {
        "0-7": 0,
        "8-15": 0,
        "16-30": 0,
        "31-60": 0,
        ">60": 0,
    }

    for row in rows:
        counts[row.age_bucket] = int(row.count)

    return [
        {
            "age": age,
            "count": count,
        }
        for age, count in counts.items()
    ]


# =========================================================
# SEND-BACK TREND
# =========================================================

async def get_send_back_trend(
    session: AsyncSession,
):
    result = await session.execute(
        text(
            """
            SELECT
                DATE_TRUNC(
                    'month',
                    occurred_at
                ) AS month_date,

                TO_CHAR(
                    DATE_TRUNC(
                        'month',
                        occurred_at
                    ),
                    'Mon'
                ) AS month,

                COUNT(*) AS count

            FROM ticket_stage_events

            WHERE action = 'returned'

            GROUP BY DATE_TRUNC(
                'month',
                occurred_at
            )

            ORDER BY month_date
            """
        )
    )

    rows = result.mappings().all()

    return [
        {
            "month": row["month"],
            "count": int(row["count"]),
        }
        for row in rows
    ]


# =========================================================
# APPROVAL TIME BY VERTICAL
# =========================================================

async def get_approval_time_by_vertical(
    session: AsyncSession,
):
    result = await session.execute(
        select(
            Division.name.label("vertical"),

            func.avg(
                Ticket.total_cycle_hours
            ).label("average_hours"),

            func.count(
                Ticket.id
            ).label("closed_tickets"),
        )
        .join(
            Ticket,
            Ticket.division_id == Division.id,
        )
        .where(
            Ticket.status == TicketStatus.CLOSED,
            Ticket.total_cycle_hours.is_not(None),
        )
        .group_by(
            Division.id,
            Division.name,
        )
        .order_by(
            func.avg(
                Ticket.total_cycle_hours
            ).desc()
        )
    )

    rows = result.all()

    return [
        {
            "vertical": row.vertical,
            "days": round(
                float(row.average_hours or 0) / 24,
                1,
            ),
            "closed_tickets": int(
                row.closed_tickets
            ),
        }
        for row in rows
    ]


# =========================================================
# APPROVAL TIME BY DEPARTMENT
# =========================================================

async def get_approval_time_by_department(
    session: AsyncSession,
):
    results = []

    for department, division_codes in (
        DEPARTMENT_MAPPING.items()
    ):
        result = await session.execute(
            select(
                func.avg(
                    Ticket.approval_cycle_hours
                ).label("average_hours"),

                func.count(
                    Ticket.id
                ).label("ticket_count"),
            )
            .join(
                Division,
                Division.id == Ticket.division_id,
            )
            .where(
                Division.code.in_(division_codes),
                Ticket.approval_cycle_hours.is_not(None),
            )
        )

        row = result.one()

        if row.average_hours is None:
            continue

        results.append(
            {
                "department": department,
                "days": round(
                    float(row.average_hours) / 24,
                    1,
                ),
                "ticket_count": int(
                    row.ticket_count
                ),
            }
        )

    results.sort(
        key=lambda item: item["days"],
        reverse=True,
    )

    return results


# =========================================================
# STAGE TIME BREAKDOWN
# =========================================================

async def get_stage_time_breakdown(
    session: AsyncSession,
):
    result = await session.execute(
        select(
            func.avg(
                Ticket.checker_cycle_hours
            ).label("checker_hours"),

            func.avg(
                Ticket.approval_cycle_hours
            ).label("approval_hours"),

            func.avg(
                Ticket.total_cycle_hours
            ).label("total_hours"),
        )
        .where(
            Ticket.total_cycle_hours.is_not(None)
        )
    )

    row = result.one()

    checker_hours = float(
        row.checker_hours or 0
    )

    approval_hours = float(
        row.approval_hours or 0
    )

    return [
        {
            "stage": "Checker",
            "days": round(
                checker_hours / 24,
                1,
            ),
        },
        {
            "stage": "Co-initiator",
            "days": 0,
        },
        {
            "stage": "Approver",
            "days": round(
                approval_hours / 24,
                1,
            ),
        },
        {
            "stage": "Send-Back",
            "days": 0,
        },
    ]


# =========================================================
# CHECKER TIME BY LEVEL
# =========================================================

async def get_checker_time_by_level(
    session: AsyncSession,
):
    """
    Current schema does not contain checker_level.

    Active checker users are deterministically divided
    into L1 / L2 / L3.

    Actual checker time is calculated from
    Ticket.checker_cycle_hours.
    """

    result = await session.execute(
        select(User.id)
        .where(
            User.role == "checker",
            User.is_active.is_(True),
        )
        .order_by(User.id)
    )

    checker_ids = [
        row.id
        for row in result.all()
    ]

    if not checker_ids:
        return []

    level_groups = {
        "L1": [],
        "L2": [],
        "L3": [],
    }

    for index, checker_id in enumerate(
        checker_ids
    ):
        level = (
            "L1"
            if index % 3 == 0
            else "L2"
            if index % 3 == 1
            else "L3"
        )

        level_groups[level].append(
            checker_id
        )

    results = []

    for level, ids in level_groups.items():

        if not ids:
            continue

        result = await session.execute(
            select(
                func.avg(
                    Ticket.checker_cycle_hours
                ).label("average_hours"),

                func.count(
                    Ticket.id
                ).label("ticket_count"),
            )
            .where(
                Ticket.checker_id.in_(ids),
                Ticket.checker_cycle_hours.is_not(None),
            )
        )

        row = result.one()

        if row.average_hours is None:
            continue

        results.append(
            {
                "level": level,
                "days": round(
                    float(row.average_hours) / 24,
                    1,
                ),
                "ticket_count": int(
                    row.ticket_count
                ),
            }
        )

    results.sort(
        key=lambda item: CHECKER_LEVELS[
            item["level"]
        ]
    )

    return results


# =========================================================
# ESCALATION BY LEVEL
# =========================================================

async def get_escalation_by_level(
    session: AsyncSession,
):
    result = await session.execute(
        select(
            Escalation.level.label("level"),
            func.count(
                Escalation.id
            ).label("count"),
        )
        .group_by(
            Escalation.level
        )
        .order_by(
            Escalation.level
        )
    )

    rows = result.all()

    return [
        {
            "level": row.level.value,
            "count": int(row.count),
        }
        for row in rows
    ]


# =========================================================
# CONFIGURABLE MEASURE
# =========================================================

async def get_configurable_measure(
    session: AsyncSession,
    measure: str = "approval_time",
    breakdown: str = "vertical",
    period: str = "month",
    view: str = "breakdown",
):
    """
    Configurable analytics.

    Supported:

        measure:
            approval_time

        breakdown:
            vertical
            department

        period:
            month

        view:
            breakdown
            trend
    """

    # =====================================================
    # VALIDATION
    # =====================================================

    if measure != "approval_time":
        raise ValueError(
            f"Unsupported measure: {measure}"
        )

    if breakdown not in {
        "vertical",
        "department",
    }:
        raise ValueError(
            f"Unsupported breakdown: {breakdown}"
        )

    if period != "month":
        raise ValueError(
            f"Unsupported period: {period}"
        )

    if view not in {
        "breakdown",
        "trend",
    }:
        raise ValueError(
            f"Unsupported view: {view}"
        )

    # =====================================================
    # BREAKDOWN VIEW
    # =====================================================

    if view == "breakdown":

        # -------------------------------------------------
        # VERTICAL
        # -------------------------------------------------

        if breakdown == "vertical":

            result = await session.execute(
                select(
                    Division.code.label("label"),

                    func.avg(
                        Ticket.approval_cycle_hours
                    ).label("average_hours"),

                    func.count(
                        Ticket.id
                    ).label("ticket_count"),
                )
                .join(
                    Ticket,
                    Ticket.division_id == Division.id,
                )
                .where(
                    Ticket.approval_cycle_hours.is_not(None)
                )
                .group_by(
                    Division.id,
                    Division.code,
                )
                .order_by(
                    Division.code
                )
            )

            rows = result.all()

            return [
                {
                    "label": row.label,
                    "value": round(
                        float(
                            row.average_hours or 0
                        ) / 24,
                        1,
                    ),
                    "unit": "days",
                    "ticket_count": int(
                        row.ticket_count
                    ),
                }
                for row in rows
            ]

        # -------------------------------------------------
        # DEPARTMENT
        # -------------------------------------------------

        results = []

        for department, division_codes in (
            DEPARTMENT_MAPPING.items()
        ):

            result = await session.execute(
                select(
                    func.avg(
                        Ticket.approval_cycle_hours
                    ).label("average_hours"),

                    func.count(
                        Ticket.id
                    ).label("ticket_count"),
                )
                .join(
                    Division,
                    Division.id == Ticket.division_id,
                )
                .where(
                    Division.code.in_(division_codes),
                    Ticket.approval_cycle_hours.is_not(None),
                )
            )

            row = result.one()

            if row.average_hours is None:
                continue

            results.append(
                {
                    "label": department,
                    "value": round(
                        float(
                            row.average_hours
                        ) / 24,
                        1,
                    ),
                    "unit": "days",
                    "ticket_count": int(
                        row.ticket_count
                    ),
                }
            )

        results.sort(
            key=lambda item: item["value"],
            reverse=True,
        )

        return results

    # =====================================================
    # TREND VIEW
    # =====================================================

    result = await session.execute(
        text(
            """
            SELECT
                DATE_TRUNC(
                    'month',
                    created_at
                ) AS month_date,

                TO_CHAR(
                    DATE_TRUNC(
                        'month',
                        created_at
                    ),
                    'Mon YYYY'
                ) AS month,

                ROUND(
                    (
                        AVG(
                            approval_cycle_hours
                        ) / 24
                    )::numeric,
                    1
                ) AS average_days,

                COUNT(*) AS ticket_count

            FROM tickets

            WHERE
                approval_cycle_hours IS NOT NULL

            GROUP BY
                DATE_TRUNC(
                    'month',
                    created_at
                )

            ORDER BY
                month_date
            """
        )
    )

    rows = result.mappings().all()

    return [
        {
            "label": row["month"],
            "value": float(
                row["average_days"] or 0
            ),
            "unit": "days",
            "ticket_count": int(
                row["ticket_count"]
            ),
        }
        for row in rows
    ]