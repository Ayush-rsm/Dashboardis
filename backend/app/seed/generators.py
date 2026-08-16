import random
import uuid
from datetime import datetime, timedelta, timezone


# =========================================================
# DIVISIONS
# =========================================================

DIVISIONS = [
    {
        "code": "IT",
        "name": "Information Technology",
        "sla_hours": 48,
    },
    {
        "code": "FIN",
        "name": "Finance",
        "sla_hours": 72,
    },
    {
        "code": "OPS",
        "name": "Operations",
        "sla_hours": 72,
    },
    {
        "code": "HR",
        "name": "Human Resources",
        "sla_hours": 72,
    },
    {
        "code": "LEGAL",
        "name": "Legal",
        "sla_hours": 48,
    },
    {
        "code": "PROC",
        "name": "Procurement",
        "sla_hours": 96,
    },
]


# =========================================================
# TICKET TYPES
# =========================================================

TICKET_TYPES = [
    {
        "code": "ONBOARDING",
        "name": "Employee Onboarding",
        "requires_approver": True,
    },
    {
        "code": "CHANGE_REQ",
        "name": "Change Request",
        "requires_approver": True,
    },
    {
        "code": "ACCESS_REQ",
        "name": "Access Request",
        "requires_approver": False,
    },
    {
        "code": "EXCEPTION",
        "name": "Policy Exception",
        "requires_approver": True,
    },
    {
        "code": "PROCUREMENT",
        "name": "Procurement Request",
        "requires_approver": True,
    },
]


# =========================================================
# USERS
# =========================================================

FIRST_NAMES = [
    "John",
    "Rahul",
    "Priya",
    "Neha",
    "Rohan",
    "Ankit",
    "Jack",
    "Vikram",
    "Aditi",
    "Karan",
    "Meera",
    "Arjun",
    "Jacob",
    "Nikhil",
    "Kavya",
    "Aman",
    "Riya",
    "Saurabh",
    "Ishita",
    "Varun",
    "Simran",
    "Aditya",
    "Tanya",
    "Manish",
    "Divya",
]


# =========================================================
# TICKET TITLES
# =========================================================

TICKET_TITLES = [
    "New employee onboarding request",
    "Production access request",
    "Vendor account creation",
    "Payment exception approval",
    "Infrastructure change request",
    "Policy exception request",
    "Procurement approval",
    "Application access modification",
    "Finance reconciliation request",
    "Employee role update",
    "Security access review",
    "System configuration change",
    "Software license request",
    "Database access request",
    "Vendor payment approval",
    "Employee transfer request",
    "Network configuration request",
    "Purchase order approval",
    "Compliance exception request",
    "Application deployment request",
]


# =========================================================
# TIME
# =========================================================

def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# =========================================================
# TICKET STATUS
# =========================================================

def weighted_status(
    rng: random.Random,
) -> str:
    """
    Realistic dashboard status distribution.

    Approximate distribution:

        Closed             55%
        Pending Checker    12%
        Pending Approver   10%
        Open                8%
        Approved            7%
        Rejected            5%
        Cancelled           3%

    Total = 100%
    """

    value = rng.random()

    # 55% CLOSED
    if value < 0.55:
        return "closed"

    # 12% PENDING CHECKER
    if value < 0.67:
        return "pending_checker"

    # 10% PENDING APPROVER
    if value < 0.77:
        return "pending_approver"

    # 8% OPEN
    if value < 0.85:
        return "open"

    # 7% APPROVED
    if value < 0.92:
        return "approved"

    # 5% REJECTED
    if value < 0.97:
        return "rejected"

    # 3% CANCELLED
    return "cancelled"


# =========================================================
# PRIORITY
# =========================================================

def weighted_priority(
    rng: random.Random,
) -> str:
    """
    Approximate priority distribution:

        Medium      50%
        Low         25%
        High        18%
        Critical     7%
    """

    value = rng.random()

    if value < 0.50:
        return "medium"

    if value < 0.75:
        return "low"

    if value < 0.93:
        return "high"

    return "critical"


# =========================================================
# SEND-BACK PROBABILITY
# =========================================================

def should_send_back(
    rng: random.Random,
) -> bool:
    """
    Approximately 15% of tickets
    experience a checker send-back.
    """

    return rng.random() < 0.15


# =========================================================
# NUMBER OF SEND-BACKS
# =========================================================

def number_of_send_backs(
    rng: random.Random,
) -> int:
    """
    Distribution:

        0 -> 85%
        1 -> 11%
        2 -> 3%
        3 -> 1%
    """

    value = rng.random()

    if value < 0.85:
        return 0

    if value < 0.96:
        return 1

    if value < 0.99:
        return 2

    return 3


# =========================================================
# RANDOM WEEKDAY DATETIME
# =========================================================

def random_weekday_datetime(
    rng: random.Random,
    start: datetime,
    end: datetime,
) -> datetime:

    total_seconds = int(
        (end - start).total_seconds()
    )

    while True:

        value = (
            start
            + timedelta(
                seconds=rng.randint(
                    0,
                    total_seconds,
                )
            )
        )

        # Monday-Friday
        if value.weekday() < 5:
            return value


# =========================================================
# WORKFLOW DURATION
# =========================================================

def lognormal_hours(
    rng: random.Random,
    division_code: str,
) -> float:
    """
    Generates right-skewed workflow durations.

    Some divisions intentionally have
    slightly longer processing times.
    """

    hours = rng.lognormvariate(
        2.0,
        0.8,
    )

    # Legal is slower
    if division_code == "LEGAL":
        hours *= 1.7

    # Finance is slightly slower
    elif division_code == "FIN":
        hours *= 1.2

    # Procurement is slightly slower
    elif division_code == "PROC":
        hours *= 1.15

    return max(
        1.0,
        hours,
    )


# =========================================================
# CHECKER DURATION
# =========================================================

def checker_duration_hours(
    rng: random.Random,
    total_cycle_hours: float,
) -> float:

    return (
        total_cycle_hours
        * rng.uniform(
            0.25,
            0.45,
        )
    )


# =========================================================
# APPROVAL DURATION
# =========================================================

def approval_duration_hours(
    rng: random.Random,
    total_cycle_hours: float,
) -> float:

    return (
        total_cycle_hours
        * rng.uniform(
            0.25,
            0.55,
        )
    )


# =========================================================
# SEND-BACK DELAY
# =========================================================

def send_back_delay_hours(
    rng: random.Random,
) -> float:
    """
    Time before checker sends the ticket back.
    """

    return rng.uniform(
        2,
        24,
    )


# =========================================================
# RESUBMISSION DELAY
# =========================================================

def resubmission_delay_hours(
    rng: random.Random,
) -> float:
    """
    Time taken by maker to resubmit
    after a send-back.
    """

    return rng.uniform(
        2,
        24,
    )


# =========================================================
# ESCALATION PROBABILITY
# =========================================================

def should_escalate(
    rng: random.Random,
) -> bool:

    return rng.random() < 0.18


# =========================================================
# ESCALATION LEVEL
# =========================================================

def weighted_escalation_level(
    rng: random.Random,
) -> str:
    """
    Distribution:

        L1 -> 60%
        L2 -> 30%
        L3 -> 10%
    """

    value = rng.random()

    if value < 0.60:
        return "L1"

    if value < 0.90:
        return "L2"

    return "L3"


# =========================================================
# ESCALATION RESOLUTION
# =========================================================

def escalation_is_resolved(
    rng: random.Random,
) -> bool:

    return rng.random() < 0.70


# =========================================================
# ESCALATION RESOLUTION TIME
# =========================================================

def escalation_resolution_hours(
    rng: random.Random,
) -> float:

    return rng.uniform(
        2,
        48,
    )


# =========================================================
# REFERENCE NUMBER
# =========================================================

def make_reference_no(
    index: int,
) -> str:

    return f"TKT-{index:06d}"


# =========================================================
# USER EMAIL
# =========================================================

def make_user_email(
    first_name: str,
    index: int,
) -> str:

    return (
        f"{first_name.lower()}"
        f"{index}"
        "@example.com"
    )


# =========================================================
# UUID
# =========================================================

def random_uuid() -> uuid.UUID:
    return uuid.uuid4()