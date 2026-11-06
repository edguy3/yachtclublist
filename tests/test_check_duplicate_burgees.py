import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scripts.check_duplicate_burgees import find_duplicate_burgees, parse_club_burgees


class DuplicateBurgeeTests(unittest.TestCase):
    def test_parses_burgee_paths_and_finds_duplicate_references(self):
        yaml_text = """
- club:
  name: Alpha Yacht Club
  burgee: alpha_yc.png
- club:
  name: Beta Yacht Club
  burgee: alpha_yc.png
- club:
  name: Gamma Yacht Club
  burgee: gamma_yc.png
"""
        image_files = ["alpha_yc.png", "gamma_yc.png"]

        clubs = parse_club_burgees(yaml_text)
        duplicates = find_duplicate_burgees(clubs, image_files)

        self.assertEqual(duplicates, [("alpha_yc.png", ["Alpha Yacht Club", "Beta Yacht Club"])])


if __name__ == "__main__":
    unittest.main()
