from datetime import datetime
from enum import Enum
import uuid

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class StageName(str, Enum):
    CREATED = "created"
    CHECKER = "checker"
    APPROVER = "approver"
    CLOSURE = "closure"


class StageAction(str, Enum):
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    RETURNED = "returned"
    CLOSED = "closed"


class TicketStageEvent(Base):
    __tablename__ = "ticket_stage_events"

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

    stage: Mapped[StageName] = mapped_column(
        SQLEnum(
            StageName,
            name="stage_name",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
    )

    action: Mapped[StageAction] = mapped_column(
        SQLEnum(
            StageAction,
            name="stage_action",
            values_callable=lambda enum_cls: [item.value for item in enum_cls],
        ),
        nullable=False,
    )

    actor_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        index=True,
    )