from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import chat_with_dashboard


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post(
    "",
    response_model=ChatResponse,
)
async def chat(
    payload: ChatRequest,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    answer = await chat_with_dashboard(
        session=session,
        message=payload.message,
    )

    return ChatResponse(
        answer=answer,
    )