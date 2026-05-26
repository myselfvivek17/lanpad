from __future__ import annotations

from fastapi import APIRouter, Depends, FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from agents.common.app_factory import require_auth
from agents.laptop import input_win


class TypeReq(BaseModel):
    text: str = Field(min_length=1, max_length=4096)


class KeyReq(BaseModel):
    key: str


class ShortcutReq(BaseModel):
    keys: list[str] = Field(min_length=1, max_length=6)


class ClickReq(BaseModel):
    button: str = "left"
    double: bool = False


def attach(app: FastAPI) -> None:
    r = APIRouter()

    @r.post("/api/keyboard/text")
    def keyboard_text(req: TypeReq, _: dict = Depends(require_auth)):
        input_win.type_text(req.text)
        return {"ok": True}

    @r.post("/api/keyboard/shortcut")
    def keyboard_shortcut(req: ShortcutReq, _: dict = Depends(require_auth)):
        try:
            input_win.shortcut(req.keys)
        except ValueError as e:
            return JSONResponse({"error": str(e)}, status_code=400)
        return {"ok": True}

    @r.post("/api/keyboard/key")
    def keyboard_key(req: KeyReq, _: dict = Depends(require_auth)):
        try:
            input_win.press_key(req.key)
        except ValueError as e:
            return JSONResponse({"error": str(e)}, status_code=400)
        return {"ok": True}

    @r.post("/api/mouse/click")
    def mouse_click(req: ClickReq, _: dict = Depends(require_auth)):
        input_win.click(req.button, double=req.double)
        return {"ok": True}

    app.include_router(r)
