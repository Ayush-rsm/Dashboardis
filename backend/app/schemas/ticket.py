from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.ticket import TicketPriority, TicketStatus
from app.models.ticket_stage_event import StageAction, StageName


class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    division_id: int
    type_id: int
    priority: TicketPriority = TicketPriority.MEDIUM


class TicketUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    priority: TicketPriority | None = None


class TicketActionRequest(BaseModel):
    action: StageAction
    remarks: str | None = Field(
        default=None,
        max_length=1000,
    )


class TicketResponse(BaseModel):
    id: UUID
    reference_no: str
    title: str
    division_id: int
    type_id: int
    status: TicketStatus
    priority: TicketPriority
    maker_id: UUID
    checker_id: UUID | None
    approver_id: UUID | None
    created_at: datetime
    checker_action_at: datetime | None
    approver_action_at: datetime | None
    closed_at: datetime | None
    checker_cycle_hours: Decimal | None
    approval_cycle_hours: Decimal | None
    total_cycle_hours: Decimal | None
    is_escalated: bool
    sla_breached: bool
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class TicketHistoryResponse(BaseModel):
    id: int
    ticket_id: UUID
    stage: StageName
    action: StageAction
    actor_id: UUID
    remarks: str | None
    occurred_at: datetime

    model_config = {
        "from_attributes": True,
    }