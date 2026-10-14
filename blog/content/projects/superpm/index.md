+++
title = "superPM"
date = 2026-10-13T00:00:00+08:00
description = "面向产品经理的 AI Skills 技能包，将需求洞察、方案设计、增长迭代、风险管理和产品战略组织成可复用的工作流。"
summary = "superPM 不只是 PRD 模板集合，而是把产品工作中的问题、证据、范围、决策和验收串起来的 Skills 工作流。"
project_summary = "把需求、PRD、上线和增长组织成可追溯的产品工作流。"
project_language = "Markdown / JavaScript"
project_status = "持续迭代"
project_order = 4
featured = true
project_kicker = "Product Management · Skills · Workflow"
project_tagline = "让产品经理把 AI 用在完整的工作链路里。"
seo_title = "superPM：从需求验证到增长迭代的产品工作流 | KongLong"
lastmod = 2026-10-14T00:00:00+08:00
project_audience = "需要从需求验证、PRD、上线到增长迭代组织产品工作的团队和个人。"
project_boundary = "工作流输出需要结合真实证据、业务判断和团队责任，不等于已完成调研或批准。"
repo_url = "https://github.com/konglong87/superPM"
docs_url = "https://github.com/konglong87/superPM/blob/main/README.md"
docs_label = "安装与使用"
tags = ["项目", "产品管理", "Skills", "工作流"]
+++

## 不只是一键生成 PRD

产品经理的工作并不是从“写文档”开始，也不会在“文档写完”时结束。需求是否真实、证据是否可靠、MVP 如何划分、上线有什么风险、结果如何衡量，都会影响最终交付。

superPM 将这些环节拆成可复用的技能和工作流，让 AI 参与产品工作的全过程，而不是只根据一句模糊想法生成一份看起来完整的文档。

## 先选任务，再选技能

面对一组技能入口，不必先记住所有名称。更实用的方式是从当前工作出发：

| 当前任务 | 工作流入口 | 重点产出 |
| --- | --- | --- |
| 验证新想法 | `/validate-idea` | 痛点证据、优先级和 MVP 边界 |
| 将需求写成 PRD | `/write-prd` | 可追溯的需求、范围和验收标准 |
| 为上线做准备 | `/plan-launch` | 风险、责任人、回滚方案和上线检查 |
| 分析已上线产品 | `/analyze-growth` | 漏斗诊断、增长实验和迭代建议 |

除此之外，仓库还组织了需求洞察、方案设计、增长迭代、风险管理、产品战略、职业发展和专家视角等方向。

## 核心设计：让工作流有证据和边界

### 区分事实、假设和决策

工作流中的结论应当能看出：什么来自有日期的来源，什么仍是待验证的假设，什么是已经做出的产品决策。

这比把推断写成确定结论更重要。没有调研证据，就不能把需求验证环节写成“已完成”；没有实际指标，也不能伪造增长分析结果。

### 复用已有产物，而不是强迫重走所有流程

新产品通常需要先厘清想法；但如果已有相关产物，或者用户明确跳过某个环节，工作流应检查并复用，而不是为了流程完整而重复劳动。

### 对话与落盘分开

可以先讨论，不急着生成文件。写入产物前，需要确认目标路径和覆盖方式，避免一启动就创建目录，或把已有文档直接覆盖。

### 单装入口不等于装齐依赖

工作流会调用其他技能。例如，只安装 `/validate-idea` 入口，并不意味着需求、市场、优先级和 MVP 等依赖已经存在。缺失依赖时应停止并提示安装，而不是模拟执行成功。

## 快速开始

安装完整技能包：

```bash
npx skills add https://github.com/konglong87/superPM
```

先查看可用技能，或者只安装一个明确需要的技能：

```bash
npx skills add https://github.com/konglong87/superPM --list
npx skills add https://github.com/konglong87/superPM --skill pm-demand
```

如果只想安装想法验证工作流，需要同时安装它所需的技能：

```bash
npx skills add https://github.com/konglong87/superPM \
  --skill validate-idea pm-demand pm-market pm-priority pm-mvp pm-brainstorm
```

安装方式与目标客户端支持的 Skill 机制有关，平台细节以仓库的当前安装说明为准。

## 一个更可靠的使用请求

下面是示例需求，不是已经验证的市场结论：

```text
我想验证一个新产品想法。先区分已有事实和待验证假设，
确认目标用户及核心问题，再提出最小验证方案。
这次先讨论，不生成文件，也不要把没有执行的调研写成已完成。
```

把约束说清楚，才能让 AI 输出更接近实际工作，而不是停留在格式整齐的模板。

## 为什么把它作为精选项目？

superPM 试图把产品管理的方法变成可执行、可复用、可以检查的工作流程。它的价值不在于替人做所有决定，而在于帮助产品经理把证据、范围、风险和结果接起来。

AI 给出的建议仍需要业务判断；涉及真实用户、合规、商业投入和上线风险时，不能把技能包输出当作最终批准。

## 项目链接

- [GitHub 仓库](https://github.com/konglong87/superPM)
- [安装和使用说明](https://github.com/konglong87/superPM/blob/main/README.md)
- [工作流契约](https://github.com/konglong87/superPM/blob/main/skills/_shared/workflow-contract.md)
