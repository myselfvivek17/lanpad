import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { WsClient } from "../api/ws";
import { request } from "../api/client";
const TAP_MS = 200;
const TAP_PX = 5;
const LONG_PRESS_MS = 500;
// ms to suppress single-finger move after second finger lifts
const SCROLL_COOLDOWN_MS = 150;
export function TrackpadSurface({ device, sensitivity, onStatus, onAuthFail }) {
    const ref = useRef(null);
    const ws = useRef(null);
    const pointers = useRef(new Map());
    const scrollEndedAt = useRef(0);
    useEffect(() => {
        const c = new WsClient(device);
        c.onStatus = onStatus;
        c.onAuthFail = onAuthFail;
        c.open();
        ws.current = c;
        return () => c.close();
    }, [device.token, device.hostname, device.port]);
    function down(e) {
        e.preventDefault();
        const now = performance.now();
        const longPressTimer = window.setTimeout(() => {
            const p = pointers.current.get(e.pointerId);
            if (p && !p.movedBeyondTap) {
                request(device, "/api/mouse/click", {
                    method: "POST",
                    body: JSON.stringify({ button: "right", double: false }),
                }).catch(() => { });
                p.movedBeyondTap = true; // suppress later tap
            }
        }, LONG_PRESS_MS);
        pointers.current.set(e.pointerId, {
            id: e.pointerId,
            startX: e.clientX, startY: e.clientY,
            lastX: e.clientX, lastY: e.clientY,
            startedAt: now,
            longPressTimer,
            movedBeyondTap: false,
        });
        e.target.setPointerCapture(e.pointerId);
    }
    function move(e) {
        const p = pointers.current.get(e.pointerId);
        if (!p)
            return;
        const dx = (e.clientX - p.lastX) * sensitivity;
        const dy = (e.clientY - p.lastY) * sensitivity;
        p.lastX = e.clientX;
        p.lastY = e.clientY;
        if (Math.abs(e.clientX - p.startX) > TAP_PX ||
            Math.abs(e.clientY - p.startY) > TAP_PX) {
            p.movedBeyondTap = true;
        }
        if (pointers.current.size === 2) {
            ws.current?.sendScroll(0, -dy); // raw pixels — backend accumulates
        }
        else if (performance.now() - scrollEndedAt.current > SCROLL_COOLDOWN_MS) {
            ws.current?.sendMove(dx, dy);
        }
    }
    function up(e) {
        const p = pointers.current.get(e.pointerId);
        if (!p)
            return;
        if (p.longPressTimer != null)
            clearTimeout(p.longPressTimer);
        const elapsed = performance.now() - p.startedAt;
        if (!p.movedBeyondTap && elapsed < TAP_MS) {
            request(device, "/api/mouse/click", {
                method: "POST",
                body: JSON.stringify({ button: "left", double: false }),
            }).catch(() => { });
        }
        const wasScrolling = pointers.current.size === 2;
        pointers.current.delete(e.pointerId);
        if (wasScrolling)
            scrollEndedAt.current = performance.now();
    }
    return (_jsx("div", { ref: ref, onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up, style: {
            flex: 1,
            background: "var(--card)",
            borderRadius: 12,
            touchAction: "none",
            userSelect: "none",
        } }));
}
