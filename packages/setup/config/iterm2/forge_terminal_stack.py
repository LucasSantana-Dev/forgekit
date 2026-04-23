from __future__ import annotations

import argparse
import json
import plistlib
import shutil
from datetime import datetime
from pathlib import Path
from typing import TypedDict

MAIN_PROFILE_GUID = "3C0E1EAF-2BA8-4C59-9A3D-844D0F6E5C21"
MAIN_PROFILE_NAME = "Forge Terminal"
FOCUS_PROFILE_GUID = "F2E4D4E0-86D5-44B1-8F64-C59A76D84613"
FOCUS_PROFILE_NAME = "Forge Focus"
AMBIENT_PROFILE_GUID = "C607A913-D4FD-44EA-B573-97BCE945A773"
AMBIENT_PROFILE_NAME = "Forge Ambient"
ANIME_PROFILE_GUID = "8C2F9271-AC63-4A6F-B35D-D4DB56A7EE39"
ANIME_PROFILE_NAME = "Forge Anime Neon"
HOTKEY_PROFILE_GUID = "A1F3B3AF-90D0-4C7D-8AE7-74A01E7460C2"
HOTKEY_PROFILE_NAME = "Forge Hotkey"

PROFILE_TARGETS = {
    "main": MAIN_PROFILE_GUID,
    "focus": FOCUS_PROFILE_GUID,
    "ambient": AMBIENT_PROFILE_GUID,
    "anime": ANIME_PROFILE_GUID,
    "hotkey": HOTKEY_PROFILE_GUID,
}

DYNAMIC_PROFILE_PATH = (
    Path.home()
    / "Library/Application Support/iTerm2/DynamicProfiles/forge-terminal.json"
)
PLIST_PATH = Path.home() / "Library/Preferences/com.googlecode.iterm2.plist"
BACKUP_DIR = Path.home() / ".config/iterm2/backups"


class Palette(TypedDict):
    bg: str
    bg_alt: str
    fg: str
    muted: str
    cursor: str
    selection: str
    ansi: list[str]


def color(hex_value: str, alpha: float = 1.0) -> dict[str, float | str]:
    hex_value = hex_value.removeprefix("#")
    red = int(hex_value[0:2], 16) / 255
    green = int(hex_value[2:4], 16) / 255
    blue = int(hex_value[4:6], 16) / 255
    return {
        "Red Component": red,
        "Green Component": green,
        "Blue Component": blue,
        "Alpha Component": alpha,
        "Color Space": "sRGB",
    }


def status_bar_layout() -> dict:
    font = ".AppleSystemUIFont 12"
    layout = {"font": font, "algorithm": 0}
    return {
        "components": [
            {
                "class": "iTermStatusBarJobComponent",
                "configuration": {
                    "knobs": {
                        "base: priority": 5,
                        "base: compression resistance": 1,
                        "minwidth": 0,
                        "maxwidth": 1.7976931348623157e308,
                        "shared text color": color("c0caf5"),
                    },
                    "layout advanced configuration dictionary value": layout,
                },
            },
            {
                "class": "iTermStatusBarWorkingDirectoryComponent",
                "configuration": {
                    "knobs": {
                        "path": "path",
                        "base: priority": 5,
                        "base: compression resistance": 1,
                        "minwidth": 0,
                        "maxwidth": 1.7976931348623157e308,
                        "shared text color": color("7dcfff"),
                    },
                    "layout advanced configuration dictionary value": layout,
                },
            },
            {
                "class": "iTermStatusBarClockComponent",
                "configuration": {
                    "knobs": {
                        "base: priority": 4,
                        "base: compression resistance": 1,
                        "date format": "HH:mm",
                        "shared text color": color("bb9af7"),
                    },
                    "layout advanced configuration dictionary value": layout,
                },
            },
        ],
        "advanced configuration": layout,
    }


def palette() -> Palette:
    return {
        "bg": "14141f",
        "bg_alt": "0d0e14",
        "fg": "d5d9f7",
        "muted": "565f89",
        "cursor": "c0caf5",
        "selection": "33467c",
        "ansi": [
            "15161e",
            "f7768e",
            "9ece6a",
            "e0af68",
            "7aa2f7",
            "bb9af7",
            "7dcfff",
            "a9b1d6",
            "414868",
            "f7768e",
            "9ece6a",
            "e0af68",
            "7aa2f7",
            "bb9af7",
            "7dcfff",
            "c0caf5",
        ],
    }


def anime_palette() -> Palette:
    return {
        "bg": "15101a",
        "bg_alt": "0f0a13",
        "fg": "f2e9f4",
        "muted": "8f7a96",
        "cursor": "f6c4d0",
        "selection": "4b2c45",
        "ansi": [
            "15101a",
            "d9829f",
            "8fbf9f",
            "d8b98a",
            "8ca8d8",
            "b79ad8",
            "9cc7cf",
            "d9cfe0",
            "3a2b3f",
            "e8a6ba",
            "a8d3b2",
            "e4c9a3",
            "a7bde6",
            "cbb2e4",
            "b7d8df",
            "f5edf7",
        ],
    }


def apply_palette(profile: dict, colors: Palette) -> None:
    profile.update(
        {
            "Background Color": color(colors["bg"]),
            "Foreground Color": color(colors["fg"]),
            "Bold Color": color(colors["fg"]),
            "Cursor Color": color(colors["cursor"]),
            "Cursor Text Color": color(colors["bg"]),
            "Selection Color": color(colors["selection"]),
            "Selected Text Color": color(colors["fg"]),
            "Link Color": color("7dcfff"),
            "Badge Color": color("7aa2f7", alpha=0.35),
            "Cursor Guide Color": color("7dcfff", alpha=0.20),
            "Tab Color": color(colors["bg_alt"]),
            "Use Tab Color": False,
        }
    )
    for index, value in enumerate(colors["ansi"]):
        profile[f"Ansi {index} Color"] = color(value)


def common_profile(name: str, guid: str) -> dict:
    profile = {
        "Name": name,
        "Guid": guid,
        "Dynamic Profile Parent Name": "Default",
        "Rewritable": True,
        "Normal Font": "FiraCodeNerdFontMono-Regular 15",
        "Non Ascii Font": "FiraCodeNerdFontMono-Regular 15",
        "Use Non-ASCII Font": True,
        "Use Bold Font": True,
        "Use Bright Bold": False,
        "Use Italic Font": True,
        "ASCII Anti Aliased": True,
        "Non-ASCII Anti Aliased": True,
        "ASCII Ligatures": True,
        "Non-ASCII Ligatures": True,
        "Draw Powerline Glyphs": True,
        "Thin Strokes": 1,
        "Load Shell Integration Automatically": True,
        "Terminal Type": "xterm-256color",
        "Custom Command": "No",
        "Command": "",
        "Option Key Sends": 2,
        "Right Option Key Sends": 2,
        "Show Mark Indicators": False,
        "Smart Cursor Color": True,
        "Minimum Contrast": 0.12,
        "Mouse Reporting": True,
        "Silence Bell": True,
        "Visual Bell": True,
        "Flashing Bell": False,
        "Blinking Cursor": False,
        "Cursor Type": 2,
        "Cursor Boost": 0,
        "Disable Window Resizing": True,
        "Use Separate Colors for Light and Dark Mode": False,
        "Status Bar Layout": status_bar_layout(),
        "Show Status Bar": False,
        "Use Tab Color": False,
        "Scrollback With Status Bar": False,
        "Unlimited Scrollback": False,
        "Scrollback Lines": 50000,
        "Scrollback in Alternate Screen": True,
    }
    apply_palette(profile, palette())
    return profile


def build_main_profile() -> dict:
    profile = common_profile(MAIN_PROFILE_NAME, MAIN_PROFILE_GUID)
    profile.update(
        {
            "Columns": 138,
            "Rows": 40,
            "Horizontal Spacing": 1.0,
            "Vertical Spacing": 1.08,
            "Transparency": 0.12,
            "Blend": 0.30,
            "Blur": True,
            "Blur Radius": 22,
            "Only The Default BG Color Uses Transparency": True,
            "Initial Use Transparency": True,
        }
    )
    return profile


def build_focus_profile() -> dict:
    profile = common_profile(FOCUS_PROFILE_NAME, FOCUS_PROFILE_GUID)
    profile.update(
        {
            "Columns": 140,
            "Rows": 42,
            "Horizontal Spacing": 1.0,
            "Vertical Spacing": 1.06,
            "Transparency": 0.04,
            "Blend": 0.18,
            "Blur": False,
            "Blur Radius": 0,
            "Only The Default BG Color Uses Transparency": True,
            "Initial Use Transparency": True,
            "Minimum Contrast": 0.14,
        }
    )
    return profile


def build_ambient_profile() -> dict:
    profile = common_profile(AMBIENT_PROFILE_NAME, AMBIENT_PROFILE_GUID)
    profile.update(
        {
            "Columns": 134,
            "Rows": 38,
            "Horizontal Spacing": 1.0,
            "Vertical Spacing": 1.08,
            "Transparency": 0.20,
            "Blend": 0.40,
            "Blur": True,
            "Blur Radius": 30,
            "Only The Default BG Color Uses Transparency": True,
            "Initial Use Transparency": True,
            "Minimum Contrast": 0.10,
        }
    )
    return profile


def build_anime_profile() -> dict:
    profile = common_profile(ANIME_PROFILE_NAME, ANIME_PROFILE_GUID)
    apply_palette(profile, anime_palette())
    profile.update(
        {
            "Columns": 132,
            "Rows": 36,
            "Horizontal Spacing": 1.0,
            "Vertical Spacing": 1.10,
            "Transparency": 0.14,
            "Blend": 0.34,
            "Blur": True,
            "Blur Radius": 26,
            "Only The Default BG Color Uses Transparency": True,
            "Initial Use Transparency": True,
            "Minimum Contrast": 0.10,
            "Badge Color": color("b56b88", alpha=0.30),
            "Link Color": color("dca3b8"),
        }
    )
    return profile


def build_hotkey_profile() -> dict:
    profile = common_profile(HOTKEY_PROFILE_NAME, HOTKEY_PROFILE_GUID)
    profile.update(
        {
            "Columns": 116,
            "Rows": 22,
            "Window Type": 1,
            "Space": -1,
            "Has Hotkey": True,
            "HotKey Window Floats": True,
            "HotKey Window AutoHides": True,
            "HotKey Window Animates": True,
            "HotKey Window Reopens On Activation": False,
            "HotKey Window Dock Click Action": 1,
            "Horizontal Spacing": 1.0,
            "Vertical Spacing": 1.05,
            "Transparency": 0.22,
            "Blend": 0.42,
            "Blur": True,
            "Blur Radius": 30,
            "Only The Default BG Color Uses Transparency": True,
            "Initial Use Transparency": True,
            "Show Status Bar": False,
        }
    )
    return profile


def backup_plist() -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = BACKUP_DIR / f"com.googlecode.iterm2.{timestamp}.plist"
    shutil.copy2(PLIST_PATH, backup_path)
    return backup_path


def write_dynamic_profiles() -> None:
    DYNAMIC_PROFILE_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "Profiles": [
            build_main_profile(),
            build_focus_profile(),
            build_ambient_profile(),
            build_anime_profile(),
            build_hotkey_profile(),
        ]
    }
    DYNAMIC_PROFILE_PATH.write_text(json.dumps(payload, indent=2) + "\n")


def set_default_bookmark(target: str) -> str:
    guid = PROFILE_TARGETS[target]
    with PLIST_PATH.open("rb") as handle:
        data = plistlib.load(handle)
    data["Default Bookmark Guid"] = guid
    with PLIST_PATH.open("wb") as handle:
        plistlib.dump(data, handle)
    return guid


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate and manage Forge iTerm2 profiles"
    )
    parser.add_argument(
        "--default",
        choices=sorted(PROFILE_TARGETS.keys()),
        default="main",
        help="Default profile target after applying profiles",
    )
    return parser.parse_args()


def main() -> None:
    if not PLIST_PATH.exists():
        raise SystemExit(f"Missing iTerm2 plist: {PLIST_PATH}")

    args = parse_args()
    backup_path = backup_plist()
    write_dynamic_profiles()
    default_guid = set_default_bookmark(args.default)

    print(f"Backed up plist to: {backup_path}")
    print(f"Wrote dynamic profiles: {DYNAMIC_PROFILE_PATH}")
    print(f"Set default profile target: {args.default} ({default_guid})")
    print(
        "Profiles available: Forge Terminal, Forge Focus, Forge Ambient, Forge Anime Neon, Forge Hotkey"
    )
    print(
        "Restart iTerm2 or open Settings > Profiles to force a reload if profiles do not appear immediately."
    )


if __name__ == "__main__":
    main()
