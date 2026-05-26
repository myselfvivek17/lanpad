import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { WsClient } from "./ws";
class FakeSocket {
    constructor(url) {
        this.readyState = 0;
        this.onopen = null;
        this.onclose = null;
        this.sent = [];
        this.url = url;
        FakeSocket.last = this;
    }
    send(s) { this.sent.push(s); }
    close() { this.onclose?.({ code: 1000 }); }
    fireOpen() { this.readyState = 1; this.onopen?.({}); }
    fireClose(code) { this.readyState = 3; this.onclose?.({ code }); }
}
FakeSocket.last = null;
FakeSocket.OPEN = 1;
FakeSocket.CLOSING = 2;
FakeSocket.CLOSED = 3;
FakeSocket.CONNECTING = 0;
const D = {
    id: "x", name: "p", hostname: "h", port: 8765, kind: "laptop", token: "tok",
};
beforeEach(() => {
    vi.stubGlobal("WebSocket", FakeSocket);
    vi.useFakeTimers();
    let raf = 0;
    vi.stubGlobal("requestAnimationFrame", (cb) => {
        raf += 1;
        queueMicrotask(() => cb(performance.now()));
        return raf;
    });
    vi.stubGlobal("cancelAnimationFrame", () => { });
});
afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});
test("connects and flushes batched moves on RAF", async () => {
    const c = new WsClient(D);
    c.open();
    FakeSocket.last.fireOpen();
    c.sendMove(1, 2);
    c.sendMove(3, 4);
    await Promise.resolve();
    expect(FakeSocket.last.sent).toHaveLength(1);
    const f = JSON.parse(FakeSocket.last.sent[0]);
    expect(f).toEqual({ t: "move", dx: 4, dy: 6 });
});
test("auth-fail close (1008) triggers onAuthFail and stops reconnect", () => {
    const c = new WsClient(D);
    const fail = vi.fn();
    c.onAuthFail = fail;
    c.open();
    FakeSocket.last.fireClose(1008);
    vi.advanceTimersByTime(20000);
    expect(fail).toHaveBeenCalledOnce();
});
test("non-auth close schedules a reconnect", () => {
    const c = new WsClient(D);
    c.open();
    FakeSocket.last.fireClose(1006);
    const before = FakeSocket.last;
    vi.advanceTimersByTime(1100);
    expect(FakeSocket.last).not.toBe(before);
});
