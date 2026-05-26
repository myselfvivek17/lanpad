import { create } from "zustand";
const STORAGE_KEY = "phone-remote:devices";
function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    }
    catch {
        return [];
    }
}
function save(d) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}
export const useDevices = create((set, get) => ({
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
export function useSelectedDevice() {
    const { devices, selected } = useDevices();
    return devices.find((d) => d.id === selected) ?? null;
}
