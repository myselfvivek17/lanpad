import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { WsClient } from "./ws";
import type { Device } from "./types";

class FakeSocket {
  static last: FakeSocket | null = null;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static CONNECTING = 0;
  url: string;
  readyState = 0;
  onopen: ((e: unknown) => void) | null = null;
  onclose: ((e: { code: number }) => void) | null = null;
  sent: string[] = [];
  constructor(url: string) {
    this.url = url;
    FakeSocket.last = this;
  }
  send(s: string) { this.sent.push(s); }
  close() { this.onclose?.({ code: 1000 }); }
  fireOpen() { this.readyState = 1; this.onopen?.({}); }
  fireClose(code: number) { this.readyState = 3; this.onclose?.({ code }); }
}

const D: Device = {
  id: "x", name: "p", hostname: "h", port: 8765, kind: "laptop", token: "tok",
};

beforeEach(() => {
  vi.stubGlobal("WebSocket", FakeSocket as unknown as typeof WebSocket);
  vi.useFakeTimers();
  let raf = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    raf += 1;
    queueMicrotask(() => cb(performance.now()));
    return raf;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("connects and flushes batched moves on RAF", async () => {
  const c = new WsClient(D);
  c.open();
  FakeSocket.last!.fireOpen();
  c.sendMove(1, 2);
  c.sendMove(3, 4);
  await Promise.resolve();
  expect(FakeSocket.last!.sent).toHaveLength(1);
  const f = JSON.parse(FakeSocket.last!.sent[0]);
  expect(f).toEqual({ t: "move", dx: 4, dy: 6 });
});

test("auth-fail close (1008) triggers onAuthFail and stops reconnect", () => {
  const c = new WsClient(D);
  const fail = vi.fn();
  c.onAuthFail = fail;
  c.open();
  FakeSocket.last!.fireClose(1008);
  vi.advanceTimersByTime(20_000);
  expect(fail).toHaveBeenCalledOnce();
});

test("non-auth close schedules a reconnect", () => {
  const c = new WsClient(D);
  c.open();
  FakeSocket.last!.fireClose(1006);
  const before = FakeSocket.last;
  vi.advanceTimersByTime(1_100);
  expect(FakeSocket.last).not.toBe(before);
});
