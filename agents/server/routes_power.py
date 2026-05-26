from __future__ import annotations

from fastapi import APIRouter, Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field

from agents.common.app_factory import require_auth
from agents.server import power_linux


class ShutdownReq(BaseModel):
    delay_seconds: int = Field(default=30, ge=0, le=3600)


def attach(app: FastAPI) -> None:
    r = APIRouter()

    @r.post("/api/power/shutdown")
    def shutdown(req: ShutdownReq, _: dict = Depends(require_auth)):
        try:
            power_linux.shutdown(delay_seconds=req.delay_seconds)
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))
        return {"ok": True}

    app.include_router(r)
