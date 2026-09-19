# Credit Insight AI

创建企业级金融 SaaS 风格的 AI 信贷风险分析助手 CreditRiskAI，面向银行普惠与公司业务客户经理。请严格按照上传的需求文档实现完整前端 MVP：

1. 整体视觉规范：
- 白底为主、沉稳金融蓝（如经典银行金融 SaaS 蓝 #1E40AF / #2563EB）为主题色，黑灰排版、圆角卡片、克制留白与层级清晰
- 严谨专业、克制的金融分析风格，非炫酷炫光 AI 科技风
- 少量红（高风险）、橙（中风险）、绿（低风险/正常）标签与状态点缀

2. 布局架构：
- 顶部导航栏：左侧产品名称 CreditRiskAI 与金融风微标，右侧当前登录用户“张经理”及通知/头像
- 左侧导航栏：工作台、客户资料（默认高亮选中）、AI客户画像、风险分析、AI分析报告、设置

3. 页面及完整交互链路（支持无缝切换与流转）：
- 客户资料页（默认入口）：显示客户“XX科技有限公司”、有限责任公司、软件服务；文件拖拽/点击上传区；已解析资料列表（2025年度财务报告.pdf、企业经营情况说明.pdf、近12个月银行流水.xlsx，带“已解析”绿色 Tag）；底部主按钮“开始AI分析 →”点击跳转至 AI客户画像。
- AI客户画像页：企业标签（软件服务业 · 成立8年 · 注册资本1000万元），分析状态“已完成”、数据来源“4份资料”；4个关键财务卡片（营业收入 2580万元/+12.5%、净利润 186万元/-9.3%、资产负债率 68.2%/+4.8%、经营活动现金流 -125万元）；“AI初步洞察”卡片；底部按钮“查看风险分析 →”点击跳转至风险分析。
- 风险分析页：综合风险“中风险”，分项统计（高风险1项、中风险2项、低风险1项），置信度91%，免责合规提示“AI辅助分析结果，不代表最终授信决策。”；风险列表（经营现金流风险-高风险、盈利能力下降-中风险、资产负债率上升-中风险等）；第一项提供“查看依据 →”点击跳转至依据详情。
- 风险依据详情页：经营现金流风险依据展开、AI判断、2024 vs 2025 关键数据对比（-205万元）、AI分析推理链步骤图（由正转负 → 回款能力下降 → 短期偿债压力增加 → 核查回款）、溯源依据（2025年度财务报告.pdf 第12页及原文高亮摘要）；支持“查看原文”弹窗以及“加入分析报告”按钮（点击进入分析报告）。
- AI分析报告页：完整的“贷前风险分析报告”，包含规范的一至五部分（客户基本情况、经营情况、财务情况、风险分析、建议进一步核查事项）；底部操作支持“重新生成”、“保存草稿”、“确认并导出”（可模拟导出 PDF/下载）。
- 工作台与设置页：提供简明的待办审批/历史企业看板与系统设置页，确保每个侧边栏菜单都有可用内容。

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9fe4fe97-294c-4cfe-8b85-b767a4268c93).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
