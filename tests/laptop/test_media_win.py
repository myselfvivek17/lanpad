from unittest.mock import patch

import pytest

from agents.laptop import media_win


@pytest.mark.parametrize("fn,vk", [
    ("playpause", media_win.VK_MEDIA_PLAY_PAUSE),
    ("next_track", media_win.VK_MEDIA_NEXT_TRACK),
    ("prev_track", media_win.VK_MEDIA_PREV_TRACK),
])
def test_media_keys_call_keybd_event(fn, vk):
    with patch("agents.laptop.media_win.ctypes") as c:
        getattr(media_win, fn)()
        # Called twice: keydown + keyup
        assert c.windll.user32.keybd_event.call_count == 2
        down = c.windll.user32.keybd_event.call_args_list[0].args
        up = c.windll.user32.keybd_event.call_args_list[1].args
        assert down[0] == vk and down[2] == 0
        assert up[0] == vk and up[2] == media_win.KEYEVENTF_KEYUP


@pytest.mark.parametrize("action,vk", [
    ("up", media_win.VK_VOLUME_UP),
    ("down", media_win.VK_VOLUME_DOWN),
    ("mute", media_win.VK_VOLUME_MUTE),
])
def test_volume(action, vk):
    with patch("agents.laptop.media_win.ctypes") as c:
        media_win.volume(action)
        assert c.windll.user32.keybd_event.call_args_list[0].args[0] == vk


def test_volume_invalid():
    with pytest.raises(ValueError):
        media_win.volume("loud")
