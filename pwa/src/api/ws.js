export class WsClient {
    constructor(d) {
        this.ws = null;
        this.pendingMove = { dx: 0, dy: 0 };
        this.pendingScroll = { dx: 0, dy: 0 };
        this.rafHandle = null;
        this.retries = 0;
        this.closedByUser = false;
        this.status = "closed";
        this.onStatus = () => { };
        this.onAuthFail = () => { };
        this.url = `ws://${d.hostname}:${d.port}/ws/input?t=${encodeURIComponent(d.token)}`;
    }
    open() {
        this.closedByUser = false;
        this.connect();
    }
    close() {
        this.closedByUser = true;
        if (this.rafHandle != null)
            cancelAnimationFrame(this.rafHandle);
        this.rafHandle = null;
        this.ws?.close();
        this.ws = null;
        this.setStatus("closed");
    }
    sendMove(dx, dy) {
        this.pendingMove.dx += dx;
        this.pendingMove.dy += dy;
        this.scheduleFlush();
    }
    sendScroll(dx, dy) {
        this.pendingScroll.dx += dx;
        this.pendingScroll.dy += dy;
        this.scheduleFlush();
    }
    sendButton(t, btn) {
        this.sendRaw({ t, btn });
    }
    setStatus(s) {
        this.status = s;
        this.onStatus(s);
    }
    connect() {
        this.setStatus("connecting");
        const ws = new WebSocket(this.url);
        this.ws = ws;
        ws.onopen = () => {
            this.retries = 0;
            this.setStatus("open");
        };
        ws.onclose = (e) => {
            this.ws = null;
            if (e.code === 1008) {
                this.onAuthFail();
                this.setStatus("closed");
                return;
            }
            this.setStatus("closed");
            if (!this.closedByUser)
                this.scheduleReconnect();
        };
    }
    scheduleReconnect() {
        const delay = Math.min(1000 * 2 ** this.retries, 10000);
        this.retries += 1;
        setTimeout(() => {
            if (!this.closedByUser)
                this.connect();
        }, delay);
    }
    scheduleFlush() {
        if (this.rafHandle != null)
            return;
        this.rafHandle = requestAnimationFrame(() => {
            this.rafHandle = null;
            const { dx: mx, dy: my } = this.pendingMove;
            const { dx: sx, dy: sy } = this.pendingScroll;
            if (mx || my)
                this.sendRaw({ t: "move", dx: mx, dy: my });
            if (sx || sy)
                this.sendRaw({ t: "scroll", dx: sx, dy: sy });
            this.pendingMove = { dx: 0, dy: 0 };
            this.pendingScroll = { dx: 0, dy: 0 };
        });
    }
    sendRaw(f) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(f));
        }
    }
}
