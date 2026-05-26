from __future__ import annotations

from fastapi import APIRouter, Depends, FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from agents.common.app_factory import require_auth
from agents.laptop import media_win


class VolumeReq(BaseModel):
    action: str  # "up" | "down" | "mute"


def attach(app: FastAPI) -> None:
    r = APIRouter()

    @r.post("/api/media/playpause")
    def playpause(_: dict = Depends(require_auth)):
        media_win.playpause()
        return {"ok": True}

    @r.post("/api/media/next")
    def next_track(_: dict = Depends(require_auth)):
        media_win.next_track()
        return {"ok": True}

    @r.post("/api/media/prev")
    def prev_track(_: dict = Depends(require_auth)):
        media_win.prev_track()
        return {"ok": True}

    @r.post("/api/media/volume")
    def volume(req: VolumeReq, _: dict = Depends(require_auth)):
        try:
            media_win.volume(req.action)
        except ValueError as e:
            return JSONResponse({"error": str(e)}, status_code=400)
        return {"ok": True}

    app.include_router(r)
