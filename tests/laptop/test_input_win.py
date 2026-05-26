from unittest.mock import patch

import pytest

from agents.laptop import input_win


def test_move_rel_calls_pyautogui():
    with patch("agents.laptop.input_win.pyautogui") as pg:
        input_win.move_rel(5.7, -3.2)
        pg.moveRel.assert_called_once_with(5, -3, _pause=False)


def test_scroll_vertical_and_horizontal():
    with patch("agents.laptop.input_win.pyautogui") as pg:
        input_win.scroll(2, -3)
        pg.scroll.assert_called_once_with(-3)
        pg.hscroll.assert_called_once_with(2)


def test_click_left():
    with patch("agents.laptop.input_win.pyautogui") as pg:
        input_win.click("left", double=False)
        pg.click.assert_called_once_with(button="left", clicks=1, _pause=False)


def test_click_double_right():
    with patch("agents.laptop.input_win.pyautogui") as pg:
        input_win.click("right", double=True)
        pg.click.assert_called_once_with(button="right", clicks=2, _pause=False)


def test_button_down_up():
    with patch("agents.laptop.input_win.pyautogui") as pg:
        input_win.mouse_down("left")
        input_win.mouse_up("left")
        pg.mouseDown.assert_called_once_with(button="left", _pause=False)
        pg.mouseUp.assert_called_once_with(button="left", _pause=False)


def test_type_text():
    with patch("agents.laptop.input_win.pyautogui") as pg:
        input_win.type_text("hello")
        pg.typewrite.assert_called_once_with("hello", interval=0.01)


def test_press_key():
    with patch("agents.laptop.input_win.pyautogui") as pg:
        input_win.press_key("esc")
        pg.press.assert_called_once_with("esc")


def test_press_key_rejects_unknown():
    with pytest.raises(ValueError):
        input_win.press_key("blammo")


def test_shortcut_chord():
    with patch("agents.laptop.input_win.pyautogui") as pg:
        input_win.shortcut(["ctrl", "c"])
        pg.hotkey.assert_called_once_with("ctrl", "c")


def test_shortcut_rejects_unknown_key():
    with pytest.raises(ValueError):
        input_win.shortcut(["ctrl", "blammo"])
