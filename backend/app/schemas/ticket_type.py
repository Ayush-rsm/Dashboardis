from pydantic import BaseModel, Field


class TicketTypeCreate(BaseModel):
    code: str = Field(min_length=1, max_length=32)
    name: str = Field(min_length=1, max_length=100)
    requires_approver: bool = False


class TicketTypeUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=32)
    name: str | None = Field(default=None, min_length=1, max_length=100)
    requires_approver: bool | None = None


class TicketTypeResponse(BaseModel):
    id: int
    code: str
    name: str
    requires_approver: bool

    model_config = {
        "from_attributes": True,
    }