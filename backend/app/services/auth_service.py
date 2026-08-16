from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.jwt import create_access_token
from app.core.security import verify_password
from app.models import User

from app.services.token_service import create_refresh_token


async def authenticate_user(
    session: AsyncSession,
    email: str,
    password: str,
) -> User | None:

    result = await session.execute(
        select(User).where(User.email == email)
    )

    user = result.scalar_one_or_none()

    if user is None:
        return None

    if not user.is_active:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user


async def login_user(
    session: AsyncSession,
    email: str,
    password: str,
) -> dict | None:

    user = await authenticate_user(
        session,
        email,
        password,
    )

    if user is None:
        return None

    user.last_login_at = datetime.now(timezone.utc)

    access_token = create_access_token(
        str(user.id)
    )

    refresh_token = await create_refresh_token(
        session,
        user.id,
    )

    await session.commit()

    return {
        "user": user,
        "access_token": access_token,
        "refresh_token": refresh_token,
    }