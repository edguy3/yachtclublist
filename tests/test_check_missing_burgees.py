import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.check_missing_burgees import find_missing_burgees, parse_club_burgees


class MissingBurgeeTests(unittest.TestCase):
    def test_parses_burgee_paths_and_finds_missing_files(self):
        yaml_text = """
- club:
  name: Alpha Yacht Club
  burgee: alpha_yc.png
- club:
  name: Beta Yacht Club
  burgee: beta_yc.png
"""
        image_files = ["alpha_yc.png"]

        clubs = parse_club_burgees(yaml_text)
        missing = find_missing_burgees(clubs, image_files)

        self.assertEqual(clubs[0]["name"], "Alpha Yacht Club")
        self.assertEqual(clubs[0]["burgee"], "alpha_yc.png")
        self.assertEqual(missing, [("Beta Yacht Club", "beta_yc.png")])


if __name__ == "__main__":
    unittest.main()
