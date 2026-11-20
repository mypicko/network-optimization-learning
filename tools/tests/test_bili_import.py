"""浏览器模式导入脚本的单元测试（不联网）。运行：python -m pytest -q tools/tests"""
import os
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import bili_import  # noqa: E402


class MergeTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.patch = mock.patch.object(bili_import, "SUB_DIR", self.tmp.name)
        self.patch.start()

    def tearDown(self) -> None:
        self.patch.stop()
        self.tmp.cleanup()

    def test_merges_hits_and_queries(self) -> None:
        cache = {"hits": {"BV1": {"title": "a", "queries": {"q1": 1}}}, "queries_done": ["q1"]}
        data = {"hits": {"BV1": {"title": "a", "queries": {"q2": 3}}, "BV2": {"title": "b", "queries": {"q2": 1}}},
                "queries_done": ["q2"]}
        bili_import.merge_module(cache, data)
        self.assertEqual(cache["hits"]["BV1"]["queries"], {"q1": 1, "q2": 3})
        self.assertIn("BV2", cache["hits"])
        self.assertEqual(cache["queries_done"], ["q1", "q2"])

    def test_video_cleaned_and_subtitle_written(self) -> None:
        cache: dict = {}
        v = {"bvid": "BV9", "title": "5G", "desc": "x" * 500, "view": 10, "uname": "不该保存",
             "comments": [{"text": "讲得最清楚", "like": 3, "member": "某用户"}], "subtitle": "第一行\n第二行"}
        n = bili_import.merge_module(cache, {"videos": {"BV9": v}})
        saved = cache["videos"]["BV9"]
        self.assertEqual(n, 1)
        self.assertNotIn("uname", saved)
        self.assertNotIn("subtitle", saved)
        self.assertEqual(saved["comments"], [{"text": "讲得最清楚", "like": 3}])
        self.assertEqual(len(saved["desc"]), 300)
        self.assertTrue(saved["has_subtitle"])
        with open(os.path.join(self.tmp.name, "BV9.txt"), encoding="utf-8") as f:
            self.assertEqual(f.read(), "第一行\n第二行")

    def test_no_subtitle(self) -> None:
        cache: dict = {}
        bili_import.merge_module(cache, {"videos": {"BV8": {"bvid": "BV8", "subtitle": ""}}})
        self.assertFalse(cache["videos"]["BV8"]["has_subtitle"])
        self.assertTrue(cache["videos"]["BV8"]["subtitle_checked"])


if __name__ == "__main__":
    unittest.main()
