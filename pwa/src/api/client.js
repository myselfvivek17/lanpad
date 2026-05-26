export class ApiError extends Error {
    constructor(status, body) {
        super(`HTTP ${status}`);
        this.status = status;
        this.body = body;
    }
}
function baseUrl(d) {
    return `http://${d.hostname}:${d.port}`;
}
export async function request(d, path, init = {}) {
    const r = await fetch(`${baseUrl(d)}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
            Authorization: `Bearer ${d.token}`,
        },
    });
    if (!r.ok) {
        let body = null;
        try {
            body = await r.json();
        }
        catch { }
        throw new ApiError(r.status, body);
    }
    if (r.status === 204)
        return undefined;
    return r.json();
}
// Pairing has no token yet, so a separate helper.
export async function pair(hostname, port, pin, deviceName) {
    const r = await fetch(`http://${hostname}:${port}/api/pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, device_name: deviceName }),
    });
    if (!r.ok) {
        let body = null;
        try {
            body = await r.json();
        }
        catch { }
        throw new ApiError(r.status, body);
    }
    return r.json();
}
