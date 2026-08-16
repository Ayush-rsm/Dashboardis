from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models import Division, User


ALLOWED_ROLES = {
    "admin",
    "maker",
    "checker",
    "approver",
    "viewer",
}


async def list_users(
    session: AsyncSession,
    role: str | None = None,
    division_id: int | None = None,
):
    query = select(User).order_by(User.created_at.desc())

    if role is not None:
        if role not in ALLOWED_ROLES:
            raise ValueError("Invalid role")

        query = query.where(User.role == role)

    if division_id is not None:
        query = query.where(
            User.division_id == division_id
        )

    result = await session.execute(query)

    return result.scalars().all()


async def get_user(
    session: AsyncSession,
    user_id,
):
    result = await session.execute(
        select(User).where(
            User.id == user_id
        )
    )

    return result.scalar_one_or_none()


async def create_user(
    session: AsyncSession,
    email: str,
    password: str,
    full_name: str,
    role: str,
    division_id: int | None,
    is_active: bool,
):
    if role not in ALLOWED_ROLES:
        raise ValueError("Invalid role")

    existing = await session.execute(
        select(User).where(
            User.email == email
        )
    )

    if existing.scalar_one_or_none() is not None:
        raise ValueError("Email already exists")

    if division_id is not None:
        division_result = await session.execute(
            select(Division).where(
                Division.id == division_id
            )
        )

        if division_result.scalar_one_or_none() is None:
            raise ValueError("Division not found")

    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        role=role,
        division_id=division_id,
        is_active=is_active,
    )

    session.add(user)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise ValueError("Email already exists")

    await session.refresh(user)

    return user


async def update_user(
    session: AsyncSession,
    user_id,
    email: str | None,
    password: str | None,
    full_name: str | None,
    role: str | None,
    division_id: int | None,
    is_active: bool | None,
):
    user = await get_user(
        session,
        user_id,
    )

    if user is None:
        raise ValueError("User not found")

    if role is not None:
        if role not in ALLOWED_ROLES:
            raise ValueError("Invalid role")

        user.role = role

    if email is not None and email != user.email:
        existing = await session.execute(
            select(User).where(
                User.email == email,
                User.id != user_id,
            )
        )

        if existing.scalar_one_or_none() is not None:
            raise ValueError("Email already exists")

        user.email = email

    if division_id is not None:
        division_result = await session.execute(
            select(Division).where(
                Division.id == division_id
            )
        )

        if division_result.scalar_one_or_none() is None:
            raise ValueError("Division not found")

        user.division_id = division_id

    if password is not None:
        user.password_hash = hash_password(
            password
        )

    if full_name is not None:
        user.full_name = full_name

    if is_active is not None:
        user.is_active = is_active

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise ValueError("User update failed")

    await session.refresh(user)

    return user