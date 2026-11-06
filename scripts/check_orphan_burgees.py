#!/usr/bin/env python3
"""Report burgee images in the images directory that are not referenced by any club."""

from __future__ import annotations

import argparse
import fnmatch
import re
import sys
from pathlib import Path
from typing import List

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


def load_gitignore_patterns(gitignore_path: Path) -> List[str]:
    if not gitignore_path.exists():
        return []

    patterns: List[str] = []
    for raw_line in gitignore_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        patterns.append(line)
    return patterns


def should_ignore(path_name: str, patterns: List[str]) -> bool:
    for pattern in patterns:
        if fnmatch.fnmatch(path_name, pattern):
            return True
    return False


def find_orphan_burgees(clubs: List[dict[str, str]], image_files: List[str], gitignore_patterns: List[str] | None = None) -> List[str]:
    referenced = {Path(club["burgee"]).name for club in clubs if club.get("burgee")}
    patterns = gitignore_patterns or []
    return sorted(
        path for path in image_files
        if not should_ignore(path, patterns) and Path(path).name not in referenced
    )


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
    gitignore_patterns = load_gitignore_patterns(repo_root / ".gitignore")
    image_files = [path.name for path in images_dir.iterdir() if path.is_file()]
    orphaned = find_orphan_burgees(clubs, image_files, gitignore_patterns)

    if orphaned:
        print(f"Orphaned burgee files: {len(orphaned)}")
        for name in orphaned:
            print(f"- {name}")
        return 1

    print("All burgee images are referenced by a club entry.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
