from pydantic import BaseModel, Field


class DivisionCreate(BaseModel):
    code: str = Field(min_length=1, max_length=16)
    name: str = Field(min_length=1, max_length=80)
    sla_hours: int = Field(default=72, ge=1)
    is_active: bool = True


class DivisionUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=16)
    name: str | None = Field(default=None, min_length=1, max_length=80)
    sla_hours: int | None = Field(default=None, ge=1)
    is_active: bool | None = None


class DivisionResponse(BaseModel):
    id: int
    code: str
    name: str
    sla_hours: int
    is_active: bool

    model_config = {
        "from_attributes": True,
    }