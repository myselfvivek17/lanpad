from __future__ import annotations

import ctypes

VK_MEDIA_PLAY_PAUSE = 0xB3
VK_MEDIA_NEXT_TRACK = 0xB0
VK_MEDIA_PREV_TRACK = 0xB1
VK_VOLUME_MUTE = 0xAD
VK_VOLUME_DOWN = 0xAE
VK_VOLUME_UP = 0xAF
KEYEVENTF_KEYUP = 0x0002


def _tap(vk: int) -> None:
    ctypes.windll.user32.keybd_event(vk, 0, 0, 0)
    ctypes.windll.user32.keybd_event(vk, 0, KEYEVENTF_KEYUP, 0)


def playpause() -> None:
    _tap(VK_MEDIA_PLAY_PAUSE)


def next_track() -> None:
    _tap(VK_MEDIA_NEXT_TRACK)


def prev_track() -> None:
    _tap(VK_MEDIA_PREV_TRACK)


def volume(action: str) -> None:
    if action == "up":
        _tap(VK_VOLUME_UP)
    elif action == "down":
        _tap(VK_VOLUME_DOWN)
    elif action == "mute":
        _tap(VK_VOLUME_MUTE)
    else:
        raise ValueError(f"unknown volume action: {action}")
