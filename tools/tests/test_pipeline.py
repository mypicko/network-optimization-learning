"""挖掘流程的单元测试（不联网）。运行：python -m unittest discover tools/tests"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from bili_client import mixin_key, sign_wbi, strip_tags  # noqa: E402
from bili_fetch import preliminary_rank  # noqa: E402
from score import build_module, is_on_topic, praise_quotes, score_video  # noqa: E402

IMG, SUB = "7cd084941338484aae1ad9425b84077c", "4932caff0ff746eab6f01bf08b70ac45"


def video(**kw):
    base = {"bvid": "BV1", "aid": 1, "title": "5G 教程", "view": 10000, "favorite": 200, "like": 500,
            "coin": 100, "pages": 1, "season": False, "duration": 1200, "pubdate": 1640995200,
            "comments": []}
    return {**base, **kw}


class WbiTest(unittest.TestCase):
    def test_mixin_key(self):
        self.assertEqual(mixin_key(IMG, SUB), "ea1db124af3c7062474693fa704f4ff8")

    def test_sign_matches_documented_example(self):
        params = {"foo": "114", "bar": "514", "zab": "1919810"}
        signed = sign_wbi(params, IMG, SUB, now=1702204169)
        self.assertEqual(signed["w_rid"], "8f6f2b5b3d485fe1886cec6a0be8c5d4")
        self.assertNotIn("wts", params)  # 不修改输入

    def test_sign_strips_reserved_chars(self):
        signed = sign_wbi({"keyword": "5G (NR)!"}, IMG, SUB, now=1)
        self.assertEqual(signed["keyword"], "5G NR")

    def test_strip_tags(self):
        self.assertEqual(strip_tags('<em class="keyword">5G</em> 注册&amp;流程'), "5G 注册&流程")


class ScoreTest(unittest.TestCase):
    def test_praise_detection(self):
        hits, quotes = praise_quotes([
            {"text": "讲得最清楚的一个，工作后回来看", "like": 50},
            {"text": "第一", "like": 999},
            {"text": "终于懂了 PDU 会话", "like": 3},
        ])
        self.assertEqual(len(hits), 2)
        self.assertTrue(quotes[0].startswith("讲得最清楚"))

    def test_higher_fav_rate_scores_higher(self):
        low = score_video(video(favorite=50), 5, 1, 0, "5g")["score"]
        high = score_video(video(favorite=500), 5, 1, 0, "5g")["score"]
        self.assertGreater(high, low)

    def test_cross_platform_and_consistency_bonus(self):
        base = score_video(video(), 5, 1, 0, "5g")["score"]
        self.assertGreater(score_video(video(), 5, 4, 0, "5g")["score"], base)
        self.assertGreater(score_video(video(), 5, 1, 3, "5g")["score"], base + 15)

    def test_outdated_and_short_penalised(self):
        old = score_video(video(pubdate=1500000000), 5, 1, 0, "5g")  # 2017 年
        self.assertTrue(any("过时" in f for f in old["flags"]))
        short = score_video(video(duration=60), 5, 1, 0, "5g")
        self.assertTrue(any("3 分钟" in f for f in short["flags"]))

    def test_claude_review_irrelevant_sinks(self):
        ok = score_video(video(), 5, 1, 0, "5g")["score"]
        bad = score_video(video(), 5, 1, 0, "5g", {"relevant": False})["score"]
        self.assertLess(bad, ok * 0.5)

    def test_topic_filter(self):
        self.assertTrue(is_on_topic("12.PDU会话建立流程 5G核心网", "5g"))
        self.assertFalse(is_on_topic("免费获取PMP证书的60个PDU方法", "5g"))
        off = score_video(video(title="机柜PDU测试"), 5, 1, 0, "5g")
        self.assertTrue(any("不对题" in f for f in off["flags"]))

    def test_zero_views_safe(self):
        s = score_video(video(view=0, favorite=0, like=0, coin=0), 5, 1, 0, "5g")
        self.assertGreaterEqual(s["score"], 0)

    def test_build_module_sorted_and_trimmed(self):
        cache = {
            "queries_done": ["a", "b"],
            "hits": {"BV1": {"queries": {"a": 1}}, "BV2": {"queries": {"a": 2, "b": 1}}},
            "videos": {"BV1": video(bvid="BV1", favorite=10), "BV2": video(bvid="BV2", favorite=400)},
        }
        out = build_module(cache, "5g", {}, {}, keep=1)
        self.assertEqual([c["bvid"] for c in out], ["BV2"])
        self.assertNotIn("comments", out[0])  # 审核数据不带评论原文


class FetchTest(unittest.TestCase):
    def test_preliminary_rank_prefers_multi_query_hits(self):
        hits = {"A": {"queries": {"q1": 1}}, "B": {"queries": {"q1": 5, "q2": 3}}, "C": {"queries": {"q2": 2}}}
        self.assertEqual(preliminary_rank(hits), ["B", "A", "C"])

    def test_preliminary_rank_drops_off_topic(self):
        hits = {"A": {"title": "5G 注册流程", "queries": {"q": 1}}, "B": {"title": "电源插座PDU", "queries": {"q": 2}}}
        self.assertEqual(preliminary_rank(hits, "5g"), ["A"])


if __name__ == "__main__":
    unittest.main()
