from datetime import datetime
from decimal import Decimal
from enum import Enum
import uuid

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EscalationLevel(str, Enum):
    L1 = "L1"
    L2 = "L2"
    L3 = "L3"


class EscalationStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    WITHDRAWN = "withdrawn"


class EscalationReason(str, Enum):
    SLA_BREACH = "SLA_BREACH"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    INCOMPLETE_DOCS = "INCOMPLETE_DOCS"
    POLICY_EXCEPTION = "POLICY_EXCEPTION"
    DATA_MISMATCH = "DATA_MISMATCH"
    EXTERNAL_DEPENDENCY = "EXTERNAL_DEPENDENCY"


class Escalation(Base):
    __tablename__ = "escalations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    ticket_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tickets.id"),
        nullable=False,
        index=True,
    )

    level: Mapped[EscalationLevel] = mapped_column(
        SQLEnum(
            EscalationLevel,
            name="escalation_level",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
    )

    reason: Mapped[EscalationReason] = mapped_column(
        SQLEnum(
            EscalationReason,
            name="escalation_reason",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
    )

    reason_detail: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[EscalationStatus] = mapped_column(
        SQLEnum(
            EscalationStatus,
            name="escalation_status",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
        default=EscalationStatus.OPEN,
    )

    raised_by_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    resolved_by_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    raised_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
    )

    resolution_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    resolution_hours: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )