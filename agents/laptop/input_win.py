from __future__ import annotations

import ctypes

import pyautogui

pyautogui.FAILSAFE = False  # don't abort if cursor hits corner

# Raw Win32 mouse_event flags
_WHEEL   = 0x0800
_HWHEEL  = 0x1000

# Pixels of phone finger movement that equal one scroll notch (120 WHEEL_DELTA)
_PIXELS_PER_NOTCH = 25.0

_scroll_accum_y: float = 0.0
_scroll_accum_x: float = 0.0

_ALLOWED_KEYS = {
    "esc", "tab", "enter", "space", "backspace", "delete", "home", "end",
    "pageup", "pagedown", "up", "down", "left", "right",
    "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12",
    "ctrl", "alt", "shift", "win", "winleft", "winright",
}
_ALLOWED_KEYS |= {c for c in "abcdefghijklmnopqrstuvwxyz0123456789"}


def move_rel(dx: float, dy: float) -> None:
    pyautogui.moveRel(int(dx), int(dy), _pause=False)


def scroll(dx: float, dy: float) -> None:
    global _scroll_accum_y, _scroll_accum_x
    _scroll_accum_y += dy
    _scroll_accum_x += dx
    while abs(_scroll_accum_y) >= _PIXELS_PER_NOTCH:
        notch = 1 if _scroll_accum_y > 0 else -1
        ctypes.windll.user32.mouse_event(_WHEEL, 0, 0, notch * 120, 0)
        _scroll_accum_y -= notch * _PIXELS_PER_NOTCH
    while abs(_scroll_accum_x) >= _PIXELS_PER_NOTCH:
        notch = 1 if _scroll_accum_x > 0 else -1
        ctypes.windll.user32.mouse_event(_HWHEEL, 0, 0, notch * 120, 0)
        _scroll_accum_x -= notch * _PIXELS_PER_NOTCH


def click(button: str, double: bool = False) -> None:
    pyautogui.click(button=button, clicks=2 if double else 1, _pause=False)


def mouse_down(button: str) -> None:
    pyautogui.mouseDown(button=button, _pause=False)


def mouse_up(button: str) -> None:
    pyautogui.mouseUp(button=button, _pause=False)


def type_text(text: str) -> None:
    pyautogui.typewrite(text, interval=0.01)


def press_key(key: str) -> None:
    if key.lower() not in _ALLOWED_KEYS:
        raise ValueError(f"unknown key: {key}")
    pyautogui.press(key.lower())


def shortcut(keys: list[str]) -> None:
    norm = [k.lower() for k in keys]
    for k in norm:
        if k not in _ALLOWED_KEYS:
            raise ValueError(f"unknown key in shortcut: {k}")
    pyautogui.hotkey(*norm)
