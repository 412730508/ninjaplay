# Balance notes

## How to tune a character

All current balance adjustments live in `balance.js`; do not change combat numbers in `gameEngine.js` for ordinary tuning. Each character entry changes only the values that differ from the base design in `characters.js`.

To tune a value, change it in `BALANCE_PATCH`, run `npm run check`, then play at least three matches against a different character. Keep one change set per commit so a bad adjustment can be reverted cleanly.

## Initial recovery pass — 0.2.0

This pass deliberately improves characters whose core payoff was difficult to reach or clearly less rewarding than comparable skills. It does not touch the already high-mobility/high-damage roster until play tests show a problem.

- 火焰忍者：爆炎衝刺冷卻 10 秒 → 8 秒。
- 毒沼忍者：毒鏢傷害 4 → 5；荊棘陷阱冷卻 17 秒 → 14 秒。
- 體術忍者：指令投傷害 6 → 8；處決傷害 15 → 18、冷卻 18 秒 → 16 秒。
- 御獸忍者：觸手傷害 2 → 3；巨獸解放需求疊層 4 → 3。

蠍子與雅音忍・弦鳴已改由其角色設計直接定義，沒有額外的平衡覆寫。

## Match feedback template

Record only what was observable in a match:

```text
版本：0.2.0
對戰：角色 A vs 角色 B
勝方／比分：
最常出現的關鍵技能：
輸方是否仍有可行反制：
下一次只要嘗試的單一調整：
```

## Character implementation notes

- 千機傀儡師：傀儡從本體相對於敵人的反方向 150px 處召出，以速度 24 朝敵人前進；它與本體的距離最遠維持 150px，不再跟隨本體或自動斷線。傀儡命中時會儲存其 3 點傷害的 2/3，主動收回時對敵人釋放累積傷害。幻影交錯的煙霧半徑為 200px。
- 暗影忍者：影分身在 0.1 秒前搖後，同時環繞目標生成 5 個分身，持續 3 秒。成功反擊後的下一次黑刃突襲必定暴擊。
- 蠍子：痛苦枷鎖命中後，目標會在 3 秒內不能攻擊或防禦；距離不足不消耗冷卻。
- 蠍子：普攻傷害為 3；痛苦枷鎖施術的 3 秒期間，蠍子本身也無法普攻。
- 雅音忍・弦鳴：輪唱第二波會強制解除命中的敵方防禦姿態。
