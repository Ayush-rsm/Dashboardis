from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db.session import engine

from app.api.auth import router as auth_router
from app.api.tickets import router as tickets_router
from app.api.analytics import router as analytics_router
from app.api.divisions import router as divisions_router
from app.api.ticket_types import router as ticket_types_router
from app.api.users import router as users_router
from app.api.chat import router as chat_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))

        return {
            "status": "ok",
            "db": "connected",
        }

    except Exception as e:
        return {
            "status": "degraded",
            "db": "unreachable",
            "error": str(e),
        }


# Routers
app.include_router(auth_router)
app.include_router(tickets_router)
app.include_router(analytics_router)
app.include_router(divisions_router)
app.include_router(ticket_types_router)
app.include_router(users_router)
app.include_router(chat_router)