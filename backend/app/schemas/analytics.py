from decimal import Decimal

from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_tickets: int
    open_tickets: int
    pending_checker: int
    pending_approver: int
    approved_tickets: int
    rejected_tickets: int
    closed_tickets: int
    cancelled_tickets: int
    escalated_tickets: int
    sla_breached_tickets: int


class StatusAnalytics(BaseModel):
    status: str
    count: int


class DivisionAnalytics(BaseModel):
    division_id: int
    division_code: str
    division_name: str
    ticket_count: int


class TicketTypeAnalytics(BaseModel):
    type_id: int
    type_code: str
    type_name: str
    ticket_count: int


class ApprovalTimeAnalytics(BaseModel):
    average_checker_hours: Decimal | None
    average_approval_hours: Decimal | None
    average_total_hours: Decimal | None


class OperationalAnalytics(BaseModel):
    total_tickets: int
    open_tickets: int
    pending_checker: int
    pending_approver: int
    approved_tickets: int
    closed_tickets: int
    escalated: int
    sla_breached: int


class DecisionMatrixAnalytics(BaseModel):
    status: str
    count: int