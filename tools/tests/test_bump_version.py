"""tools/bump_version.py 的单元测试。运行：python -m unittest discover tools/tests"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from bump_version import REF_RE  # noqa: E402


class RefPatternTest(unittest.TestCase):
    def test_matches_local_assets_with_and_without_version(self):
        for ref in ['src="assets/app.js"', 'src="assets/app.js?v=abc"', 'href="assets/style.css"',
                    'src="data/lessons/5g/s0.js"']:
            self.assertIsNotNone(REF_RE.search(ref), ref)

    def test_ignores_external_and_other_files(self):
        for ref in ['src="https://cdn.example.com/a.js"', 'href="pathway.html"', 'href="#top"',
                    'src="../assets/app.js"']:
            self.assertIsNone(REF_RE.search(ref), ref)

    def test_replaces_existing_version(self):
        out = REF_RE.sub(lambda m: f"{m.group(1)}{m.group(2)}?v=NEW{m.group(3)}", 'src="assets/app.js?v=OLD"')
        self.assertEqual(out, 'src="assets/app.js?v=NEW"')


if __name__ == "__main__":
    unittest.main()
