import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.check_orphan_burgees import find_orphan_burgees, parse_club_burgees


class OrphanBurgeeTests(unittest.TestCase):
    def test_parses_burgee_paths_and_finds_orphan_files(self):
        yaml_text = """
- club:
  name: Alpha Yacht Club
  burgee: alpha_yc.png
- club:
  name: Beta Yacht Club
  burgee: beta_yc.png
"""
        image_files = ["alpha_yc.png", "gamma_yc.png"]

        clubs = parse_club_burgees(yaml_text)
        orphaned = find_orphan_burgees(clubs, image_files)

        self.assertEqual(clubs[0]["name"], "Alpha Yacht Club")
        self.assertEqual(clubs[0]["burgee"], "alpha_yc.png")
        self.assertEqual(orphaned, ["gamma_yc.png"])


if __name__ == "__main__":
    unittest.main()
