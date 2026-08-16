from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Division


async def list_divisions(
    session: AsyncSession,
):
    result = await session.execute(
        select(Division)
        .order_by(Division.name)
    )

    return result.scalars().all()


async def get_division(
    session: AsyncSession,
    division_id: int,
):
    result = await session.execute(
        select(Division).where(
            Division.id == division_id
        )
    )

    return result.scalar_one_or_none()


async def create_division(
    session: AsyncSession,
    code: str,
    name: str,
    sla_hours: int,
    is_active: bool,
):
    existing = await session.execute(
        select(Division).where(
            Division.code == code
        )
    )

    if existing.scalar_one_or_none() is not None:
        raise ValueError("Division code already exists")

    division = Division(
        code=code,
        name=name,
        sla_hours=sla_hours,
        is_active=is_active,
    )

    session.add(division)

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise ValueError("Division code already exists")

    await session.refresh(division)

    return division


async def update_division(
    session: AsyncSession,
    division_id: int,
    code: str | None,
    name: str | None,
    sla_hours: int | None,
    is_active: bool | None,
):
    division = await get_division(
        session,
        division_id,
    )

    if division is None:
        raise ValueError("Division not found")

    if code is not None and code != division.code:
        existing = await session.execute(
            select(Division).where(
                Division.code == code,
                Division.id != division_id,
            )
        )

        if existing.scalar_one_or_none() is not None:
            raise ValueError("Division code already exists")

        division.code = code

    if name is not None:
        division.name = name

    if sla_hours is not None:
        division.sla_hours = sla_hours

    if is_active is not None:
        division.is_active = is_active

    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise ValueError("Division update failed")

    await session.refresh(division)

    return division