export type Device = {
  id: string;          // local id == backend device_id (returned at pair time)
  name: string;        // user-chosen device name on this device
  hostname: string;    // e.g. "laptop.local"
  port: number;        // 8765
  kind: "laptop" | "server";
  token: string;       // bearer
};

export type WsFrame =
  | { t: "move"; dx: number; dy: number }
  | { t: "scroll"; dx: number; dy: number }
  | { t: "down"; btn: "left" | "right" }
  | { t: "up"; btn: "left" | "right" };
