# 子任务：中指 CREIS / 中指云数据与报告采集

建议模型：Sonnet
启动方式：`cd ~/Projects/housing-policy-watch && claude --model sonnet`，粘贴以下 prompt。
⚠️ 开始前需要用户配合：CREIS 登录页 https://creis.fang.com/4.0/ 用中指云APP扫码；中指云 https://www.cih-index.com 右上角登录。

---

我在做 828 房地产新政深度研究（背景见 ~/Projects/housing-policy-watch/README.md）。我有中指 CREIS 4.0 开发云订阅。用 Playwright（plugin:playwright MCP）人工节奏浏览采集——**绝不批量写脚本抓数据、绝不高频请求，网站风控严格**。每打开一个页面停顿看内容，像人一样操作。

任务分两部分：

## A. 中指云报告（www.cih-index.com，登录后）
下载或全文提取以下报告，PDF 存到：
`/Users/youhong/Library/CloudStorage/坚果云-hemayou@gmail.com/我的坚果云/Work/租赁住房战略研究/08-政策文件/2026-08-28-房地产新模式政策包/本地存档-付费文章/中指报告/`
每份另写要点笔记（要点+关键数据+短引语）到 ~/Projects/housing-policy-watch/research/notes/zhongzhi/：
1. 《中指丨住房销售制度改革来了，影响有多大？》 https://www.cih-index.com/report/detail/127327.html （828当天7页政策解读，最优先）
2. 《房贷贴息越来越多，怎么贴？》
3. 《中指丨中国房地产政策跟踪报告（2026年7月）》
4. 《中指丨政治局会议定调房地产，这次有什么不一样？》（2026-07-31）
5. 8月土地市场月报（《8月土地市场：缩量延续，京沪高热》）
6. 站内再搜「现房销售」「销售制度」「预售」，2025年以来相关专题报告择重要的3-5份
7. 928新政后如有新发的解读报告（8月29日后陆续会出）一并采集

## B. CREIS 数据（creis.fang.com/4.0）
查阅并记录（截图或抄录关键表格到笔记，存 research/notes/zhongzhi/creis-数据摘录.md，注明查询路径与口径）：
1. 全国及重点城市月度成交：2026年1-8月新房成交面积/金额同比，与2021年同期对比
2. 现房vs期房成交结构数据（如平台有此分项）
3. 百城房价指数最新月报数据
4. 土地市场：2026年重点城市宅地成交、溢价率、流拍率；央国企/民企拿地结构
5. 库存与去化周期：重点城市可售库存、出清周期（尤其区分2024年前老库存）
6. 企业数据：TOP100房企2026年1-8月销售额同比

**版权边界：报告PDF与数据摘录只存本地，绝不进 git 仓库。** 研究笔记（自己归纳的要点）可进仓库 research/notes/。
完成后在 research/notes/zhongzhi/INDEX.md 写清单。
