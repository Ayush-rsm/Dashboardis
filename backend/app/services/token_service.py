from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import RefreshToken


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(64)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def create_refresh_token(
    session: AsyncSession,
    user_id,
) -> str:
    raw_token = generate_refresh_token()

    refresh_token = RefreshToken(
        user_id=user_id,
        token_hash=hash_refresh_token(raw_token),
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )

    session.add(refresh_token)
    await session.flush()

    return raw_token


async def get_refresh_token(
    session: AsyncSession,
    raw_token: str,
):
    token_hash = hash_refresh_token(raw_token)

    result = await session.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash
        )
    )

    return result.scalar_one_or_none()