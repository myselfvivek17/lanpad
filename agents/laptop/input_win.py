from __future__ import annotations

import pyautogui

pyautogui.FAILSAFE = False  # don't abort if cursor hits corner

_ALLOWED_KEYS = {
    "esc", "tab", "enter", "space", "backspace", "delete", "home", "end",
    "pageup", "pagedown", "up", "down", "left", "right",
    "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12",
    "ctrl", "alt", "shift", "win", "winleft", "winright",
}
_ALLOWED_KEYS |= {c for c in "abcdefghijklmnopqrstuvwxyz0123456789"}


def move_rel(dx: float, dy: float) -> None:
    pyautogui.moveRel(int(dx), int(dy), _pause=False)


def scroll(dx: int, dy: int) -> None:
    if dy:
        pyautogui.scroll(int(dy))
    if dx:
        pyautogui.hscroll(int(dx))


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
