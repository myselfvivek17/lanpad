from __future__ import annotations

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from agents.common import auth
from agents.laptop import input_win


def attach(app: FastAPI) -> None:
    @app.websocket("/ws/input")
    async def ws_input(ws: WebSocket):
        token = ws.query_params.get("t", "")
        if auth.verify_token(token) is None:
            await ws.close(code=1008)
            return
        await ws.accept()
        try:
            while True:
                frame = await ws.receive_json()
                t = frame.get("t")
                try:
                    if t == "move":
                        input_win.move_rel(float(frame["dx"]), float(frame["dy"]))
                    elif t == "scroll":
                        input_win.scroll(int(frame["dx"]), int(frame["dy"]))
                    elif t == "down":
                        input_win.mouse_down(str(frame["btn"]))
                    elif t == "up":
                        input_win.mouse_up(str(frame["btn"]))
                except Exception:
                    # Don't kill the WS on a bad frame.
                    continue
        except WebSocketDisconnect:
            return
