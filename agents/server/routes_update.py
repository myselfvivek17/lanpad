from __future__ import annotations

from fastapi import APIRouter, Depends, FastAPI

from agents.common.app_factory import require_auth
from agents.server import update_linux


def attach(app: FastAPI) -> None:
    r = APIRouter()

    @r.post("/api/system/update")
    def start(_: dict = Depends(require_auth)):
        return update_linux.start_update()

    @r.get("/api/system/update/{job_id}")
    def status(job_id: str, _: dict = Depends(require_auth)):
        return update_linux.get_status(job_id)

    app.include_router(r)
