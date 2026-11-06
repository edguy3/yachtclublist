#!/usr/bin/env python3
"""Report clubs whose burgee images are missing from the images directory."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import List, Tuple

try:
    import yaml
except ImportError:  # pragma: no cover - exercised only if dependency missing
    yaml = None


def parse_club_burgees(clublist_text: str) -> List[dict[str, str]]:
    if yaml is not None:
        data = yaml.safe_load(clublist_text) or []
        clubs: List[dict[str, str]] = []
        for entry in data:
            if not isinstance(entry, dict) or "club" not in entry:
                continue
            # clublist.yml entries are flat: "- club:" is an empty key beside name/burgee.
            club = entry["club"] if isinstance(entry["club"], dict) else entry
            name = club.get("name", "")
            burgee = club.get("burgee", "")
            if name and burgee:
                clubs.append({"name": name, "burgee": burgee})
        return clubs

    clubs: List[dict[str, str]] = []
    current: dict[str, str] = {}

    for raw_line in clublist_text.splitlines():
        line = raw_line.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue

        if re.match(r"^-\s+club:\s*$", line):
            if current.get("name") and current.get("burgee"):
                clubs.append(current)
            current = {}
            continue

        name_match = re.match(r"^\s{2}name:\s*(.+)$", line)
        if name_match:
            current["name"] = name_match.group(1).strip().strip("'\"")
            continue

        burgee_match = re.match(r"^\s{2}burgee:\s*(.+)$", line)
        if burgee_match:
            current["burgee"] = burgee_match.group(1).strip().strip("'\"")

    if current.get("name") and current.get("burgee"):
        clubs.append(current)

    return clubs


def find_missing_burgees(clubs: List[dict[str, str]], image_files: List[str]) -> List[Tuple[str, str]]:
    image_set = {Path(name).name for name in image_files}
    return [(club["name"], club["burgee"]) for club in clubs if Path(club["burgee"]).name not in image_set]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("clublist", nargs="?", default="clublist.yml", help="Path to the YAML club list")
    parser.add_argument("--images-dir", default="images", help="Directory containing burgee image files")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[1]
    clublist_path = (repo_root / args.clublist).resolve() if not Path(args.clublist).is_absolute() else Path(args.clublist)
    images_dir = (repo_root / args.images_dir).resolve() if not Path(args.images_dir).is_absolute() else Path(args.images_dir)

    if not clublist_path.exists():
        print(f"Club list not found: {clublist_path}", file=sys.stderr)
        return 2
    if not images_dir.exists():
        print(f"Images directory not found: {images_dir}", file=sys.stderr)
        return 2

    clublist_text = clublist_path.read_text(encoding="utf-8")
    clubs = parse_club_burgees(clublist_text)
    image_files = [path.name for path in images_dir.iterdir() if path.is_file()]
    missing = find_missing_burgees(clubs, image_files)

    if missing:
        print(f"Missing burgee files: {len(missing)}")
        for name, burgee in missing:
            print(f"- {name}: {burgee}")
        return 1

    print("All clubs have a corresponding burgee image.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
