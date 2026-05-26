import { create } from "zustand";
import type { Device } from "../api/types";

const STORAGE_KEY = "phone-remote:devices";

function load(): Device[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Device[]) : [];
  } catch { return []; }
}
function save(d: Device[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

type State = {
  devices: Device[];
  selected: string | null;          // device id
  add: (d: Device) => void;
  remove: (id: string) => void;
  select: (id: string | null) => void;
};

export const useDevices = create<State>((set, get) => ({
  devices: load(),
  selected: null,
  add: (d) => {
    const next = [...get().devices.filter((x) => x.id !== d.id), d];
    save(next);
    set({ devices: next, selected: d.id });
  },
  remove: (id) => {
    const next = get().devices.filter((d) => d.id !== id);
    save(next);
    set({
      devices: next,
      selected: get().selected === id ? null : get().selected,
    });
  },
  select: (id) => set({ selected: id }),
}));

export function useSelectedDevice(): Device | null {
  const { devices, selected } = useDevices();
  return devices.find((d) => d.id === selected) ?? null;
}
