from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User

from app.schemas.analytics import (
    AnalyticsOverview,
    ApprovalTimeAnalytics,
    DecisionMatrixAnalytics,
    DivisionAnalytics,
    OperationalAnalytics,
    StatusAnalytics,
    TicketTypeAnalytics,
)

from app.services.analytics_service import (
    get_approval_time_analytics,
    get_approval_time_trend,
    get_decision_matrix,
    get_division_analytics,
    get_operational_analytics,
    get_overview,
    get_status_analytics,
    get_ticket_type_analytics,

    # Operational analytics
    get_open_ticket_aging,
    get_send_back_trend,
    get_approval_time_by_vertical,
    get_approval_time_by_department,
    get_stage_time_breakdown,
    get_checker_time_by_level,
    get_escalation_by_level,

    # Configurable analytics
    get_configurable_measure,
)


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


# =========================================================
# OVERVIEW
# =========================================================

@router.get(
    "/overview",
    response_model=AnalyticsOverview,
)
async def analytics_overview(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_overview(session)


# =========================================================
# STATUS
# =========================================================

@router.get(
    "/status",
    response_model=list[StatusAnalytics],
)
async def analytics_status(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_status_analytics(session)


# =========================================================
# DIVISION
# =========================================================

@router.get(
    "/by-division",
    response_model=list[DivisionAnalytics],
)
async def analytics_by_division(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_division_analytics(session)


# =========================================================
# TICKET TYPE
# =========================================================

@router.get(
    "/by-ticket-type",
    response_model=list[TicketTypeAnalytics],
)
async def analytics_by_ticket_type(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_ticket_type_analytics(session)


# =========================================================
# APPROVAL TIME
# =========================================================

@router.get(
    "/approval-time",
    response_model=ApprovalTimeAnalytics,
)
async def analytics_approval_time(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_approval_time_analytics(session)


# =========================================================
# APPROVAL TIME TREND
# =========================================================

@router.get(
    "/approval-time/trend",
)
async def analytics_approval_time_trend(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_approval_time_trend(session)


# =========================================================
# OPERATIONAL SUMMARY
# =========================================================

@router.get(
    "/operational",
    response_model=OperationalAnalytics,
)
async def analytics_operational(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_operational_analytics(session)


# =========================================================
# OPEN TICKET AGING
# =========================================================

@router.get(
    "/operational/open-ticket-aging",
)
async def analytics_open_ticket_aging(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_open_ticket_aging(session)


# =========================================================
# ADMIN L1 SEND-BACK TREND
# =========================================================

@router.get(
    "/operational/send-back-trend",
)
async def analytics_send_back_trend(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_send_back_trend(session)


# =========================================================
# APPROVAL TIME BY VERTICAL
# =========================================================

@router.get(
    "/operational/approval-time-by-vertical",
)
async def analytics_approval_time_by_vertical(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_approval_time_by_vertical(session)


# =========================================================
# APPROVAL TIME BY DEPARTMENT
# =========================================================

@router.get(
    "/operational/approval-time-by-department",
)
async def analytics_approval_time_by_department(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_approval_time_by_department(session)


# =========================================================
# STAGE TIME BREAKDOWN
# =========================================================

@router.get(
    "/operational/stage-time-breakdown",
)
async def analytics_stage_time_breakdown(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_stage_time_breakdown(session)


# =========================================================
# CHECKER TIME BY LEVEL
# =========================================================

@router.get(
    "/operational/checker-time-by-level",
)
async def analytics_checker_time_by_level(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_checker_time_by_level(session)


# =========================================================
# ESCALATION BY LEVEL
# =========================================================

@router.get(
    "/operational/escalation-by-level",
)
async def analytics_escalation_by_level(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_escalation_by_level(session)


# =========================================================
# DECISION MATRIX
# =========================================================

@router.get(
    "/decision-matrix",
    response_model=list[DecisionMatrixAnalytics],
)
async def analytics_decision_matrix(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_decision_matrix(session)


# =========================================================
# CLOSURE VOLUME
# =========================================================

@router.get(
    "/closure-volume",
)
async def closure_volume(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await session.execute(
        text(
            """
            SELECT
                TO_CHAR(
                    DATE_TRUNC('month', closed_at),
                    'Mon YYYY'
                ) AS month,

                COUNT(*) AS closed_count

            FROM tickets

            WHERE closed_at IS NOT NULL

            GROUP BY DATE_TRUNC(
                'month',
                closed_at
            )

            ORDER BY DATE_TRUNC(
                'month',
                closed_at
            )
            """
        )
    )

    rows = result.mappings().all()

    return [
        {
            "month": row["month"],
            "closed_count": int(row["closed_count"]),
        }
        for row in rows
    ]


# =========================================================
# CONFIGURABLE MEASURE
# =========================================================

@router.get(
    "/configurable-measure",
)
async def analytics_configurable_measure(
    measure: str = "approval_time",
    breakdown: str = "vertical",
    period: str = "month",
    view: str = "breakdown",
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_configurable_measure(
        session=session,
        measure=measure,
        breakdown=breakdown,
        period=period,
        view=view,
    )