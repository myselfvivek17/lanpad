from __future__ import annotations

from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from agents.common import auth, storage
from agents.common.lan_guard import LanOnlyMiddleware

_LAN_ORIGIN_REGEX = (
    r"^http://("
    r"localhost|"
    r"127\.0\.0\.1|"
    r"[a-zA-Z0-9-]+\.local|"
    r"10(\.\d{1,3}){3}|"
    r"192\.168(\.\d{1,3}){2}|"
    r"172\.(1[6-9]|2\d|3[0-1])(\.\d{1,3}){2}"
    r")(:\d+)?$"
)


class PairRequest(BaseModel):
    pin: str = Field(min_length=4, max_length=12)
    device_name: str = Field(min_length=1, max_length=64)


def _bearer_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    return authorization.split(" ", 1)[1].strip()


def require_auth(token: str = Depends(_bearer_token)) -> dict:
    rec = auth.verify_token(token)
    if rec is None:
        raise HTTPException(status_code=401, detail="invalid token")
    return rec


def build_app(*, agent_name: str, agent_kind: str, version: str) -> FastAPI:
    app = FastAPI(title=f"phone-remote {agent_kind}-agent", version=version)
    app.add_middleware(LanOnlyMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=_LAN_ORIGIN_REGEX,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
        allow_credentials=False,
    )

    @app.exception_handler(auth.RateLimitedError)
    async def rate_limit_handler(_, exc: auth.RateLimitedError):
        return JSONResponse(
            {"error": "too many attempts"},
            status_code=429,
            headers={"Retry-After": str(exc.retry_after)},
        )

    @app.exception_handler(auth.PairingError)
    async def pairing_handler(_, exc: auth.PairingError):
        return JSONResponse({"error": str(exc)}, status_code=401)

    router = APIRouter()

    @router.get("/api/health")
    def health():
        return {"name": agent_name, "agent_kind": agent_kind, "version": version}

    @router.post("/api/pair")
    def pair(req: PairRequest, request: Request):
        client_ip = request.client.host if request.client else ""
        res = auth.pair(req.pin, req.device_name, client_ip)
        return {"token": res["token"], "device_id": res["device_id"]}

    @router.get("/api/auth/devices")
    def list_devices(_: dict = Depends(require_auth)):
        return [
            {"id": t["id"], "name": t["name"], "last_seen": t["last_seen"]}
            for t in storage.list_tokens()
        ]

    @router.delete("/api/auth/devices/{device_id}", status_code=204)
    def revoke(device_id: str, _: dict = Depends(require_auth)):
        storage.revoke_token(device_id)
        return None

    app.include_router(router)
    return app
