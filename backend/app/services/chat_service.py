from google import genai
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.analytics_service import (
    get_overview,
    get_status_analytics,
    get_division_analytics,
    get_ticket_type_analytics,
    get_approval_time_analytics,
)


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


async def chat_with_dashboard(
    session: AsyncSession,
    message: str,
) -> str:

    # Fetch real dashboard data
    overview = await get_overview(session)
    status = await get_status_analytics(session)
    divisions = await get_division_analytics(session)
    ticket_types = await get_ticket_type_analytics(session)
    processing = await get_approval_time_analytics(session)

    dashboard_context = {
        "overview": overview,
        "status": status,
        "divisions": divisions,
        "ticket_types": ticket_types,
        "processing_time": processing,
    }

    prompt = f"""
You are the TicketFlow Analytics Assistant.

Answer the user's question using ONLY the dashboard
data provided below.

Rules:
1. Never invent or guess numbers.
2. If the requested information is not available,
   say that it is not currently available.
3. Keep the answer concise and professional.
4. When giving numbers, use the exact values from the data.
5. Do not expose internal implementation details.
6. You can explain trends or comparisons only when they
   can be derived directly from the provided data.

CURRENT DASHBOARD DATA:

{dashboard_context}

USER QUESTION:

{message}
"""

    response = await client.aio.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
    )

    return response.text