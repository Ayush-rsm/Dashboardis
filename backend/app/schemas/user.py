from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1, max_length=120)
    role: str = Field(default="viewer", max_length=20)
    division_id: int | None = None
    is_active: bool = True


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=120,
    )
    role: str | None = Field(
        default=None,
        max_length=20,
    )
    division_id: int | None = None
    is_active: bool | None = None
    password: str | None = Field(
        default=None,
        min_length=8,
    )


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    division_id: int | None
    is_active: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }