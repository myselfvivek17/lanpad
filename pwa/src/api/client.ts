import type { Device } from "./types";

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`HTTP ${status}`);
  }
}

function baseUrl(d: Device): string {
  return `http://${d.hostname}:${d.port}`;
}

export async function request<T = unknown>(
  d: Device,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const r = await fetch(`${baseUrl(d)}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      Authorization: `Bearer ${d.token}`,
    },
  });
  if (!r.ok) {
    let body: unknown = null;
    try { body = await r.json(); } catch {}
    throw new ApiError(r.status, body);
  }
  if (r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}

// Pairing has no token yet, so a separate helper.
export async function pair(
  hostname: string,
  port: number,
  pin: string,
  deviceName: string
): Promise<{ token: string; device_id: string }> {
  const r = await fetch(`http://${hostname}:${port}/api/pair`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin, device_name: deviceName }),
  });
  if (!r.ok) {
    let body: unknown = null;
    try { body = await r.json(); } catch {}
    throw new ApiError(r.status, body);
  }
  return r.json();
}
