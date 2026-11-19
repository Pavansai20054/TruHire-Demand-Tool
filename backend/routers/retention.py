from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.auth import require_role
from backend.database import get_db
from backend.models import ROLE_ADMIN, User
from backend.services.common.retention import get_retention_status, run_retention_cleanup

router = APIRouter(prefix="/api/retention", tags=["retention"])


@router.get("/status")
def retention_status(
    db: Session = Depends(get_db),
    user: User = Depends(require_role(ROLE_ADMIN)),
):
    """
    Get current data retention policy settings, cutoffs, and expired record counts.
    Admin-only: exposes policy details and expired record counts.
    """
    return get_retention_status(db)


@router.post("/cleanup")
def trigger_retention_cleanup(
    retention_days: Optional[int] = Query(None, description="Optional override for retention days"),
    db: Session = Depends(get_db),
    user: User = Depends(require_role(ROLE_ADMIN)),
):
    """
    Trigger manual data retention cleanup for resumes, chunks/embeddings, and JDs.
    """
    return run_retention_cleanup(
        db=db,
        resume_retention_days=retention_days,
        jd_retention_days=retention_days,
    )
