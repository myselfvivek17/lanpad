from __future__ import annotations

from fastapi import APIRouter, Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field

from agents.common.app_factory import require_auth
from agents.laptop import power_win


class ShutdownReq(BaseModel):
    delay_seconds: int = Field(default=5, ge=0, le=3600)


def attach(app: FastAPI) -> None:
    r = APIRouter()

    @r.post("/api/power/shutdown")
    def shutdown(req: ShutdownReq, _: dict = Depends(require_auth)):
        try:
            power_win.shutdown(delay_seconds=req.delay_seconds)
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))
        return {"ok": True}

    @r.post("/api/power/sleep")
    def sleep(_: dict = Depends(require_auth)):
        power_win.sleep()
        return {"ok": True}

    @r.post("/api/power/lock")
    def lock(_: dict = Depends(require_auth)):
        try:
            power_win.lock()
        except RuntimeError as e:
            raise HTTPException(status_code=500, detail=str(e))
        return {"ok": True}

    app.include_router(r)
