+++
title = "Feeling to Jargon"
date = 2026-10-13T00:00:00+08:00
description = "你说感觉，Feeling to Jargon 帮你补全专业术语，并按需扩展成可执行的 AI 提示词。"
summary = "把“有质感”“稳定”“高级”“专业一点”等模糊表达，翻译成可以理解、选择、实现和验收的专业术语。"
project_summary = "把模糊感觉翻译成专业术语，再按需补全为可执行的 AI Prompt。"
project_language = "Python / Skills"
docs_label = "查看 Skill"
project_status = "持续迭代"
project_order = 2
featured = true
project_kicker = "AI Skill · Prompt · Progressive Index"
project_tagline = "你说感觉，我帮你翻译成专业术语。"
repo_url = "https://github.com/konglong87/feeling-to-jargon"
docs_url = "https://github.com/konglong87/feeling-to-jargon/blob/main/skills/feeling-to-jargon/SKILL.md"
tags = ["项目", "AI", "Prompt", "Skills", "知识索引"]
+++


## 它要解决什么问题？

很多时候，我们知道自己想要什么，却不知道怎样用专业语言说出来：

- “做一个有质感的网站。”
- “做一个稳定的大型后端。”
- “做一个电影感的视频。”
- “这个 Dashboard 再高级一点。”

这些话表达了方向，却还不足以指导设计、开发或验收。

Feeling to Jargon 做的事情，是识别需求所属领域，按需加载相关术语，把模糊感觉扩展成更具体、更可执行的描述，同时把专业选项翻译成容易理解的语言，让人自己做真正重要的取舍。

## 从感觉到可执行表达

它的核心路径是：

```text
用户的模糊感觉
    ↓
识别根领域与专业子域
    ↓
按需加载术语、模式、技巧和模板
    ↓
翻译成容易理解的选择项
    ↓
组合成可执行、可检查的 AI Prompt
```

例如：

| 你说 | 可以进一步明确为 |
| --- | --- |
| 做一个有质感的网站 | 信息密度、字体层级、对比度、留白节奏、组件一致性 |
| 做一个稳定的大型后端 | 高可用、流量模型、水平扩展、幂等、熔断、可观测性 |
| 做一个电影感的视频 | 景别、光线、构图、色调、运动、画幅比例、声音 |
| 做一个高级感 Dashboard | 底色、强调色、布局层级、材质、内容主角 |

它不替用户决定方向，而是把“感觉”拆成可以比较、选择、实现和验收的专业选项。

## 渐进式索引

Feeling to Jargon 不把整个知识库一次性塞进上下文，而是采用渐进式索引：

```text
根领域 → 专业子域 → 用户意图 → 叶子包 → 单条术语 / 技巧 / 模板
```

一个“撤销条 + 键盘可用”的请求，只需要加载交互动效和可访问性相关的叶子包，不需要把 UI、AIGC、后端等所有知识全部加载进来。

这种结构的目标是让内容越积累，查询仍然保持边界清晰、加载可控、结果可追溯。

目前仓库已经围绕多个专业方向组织内容，包括：

- UI/UX 与交互设计
- Dashboard 与设计系统
- 动效、手势与视觉效果
- AIGC 图像和视频表达
- 后端架构与软件工程
- 平台研究与工具适配
- 职场表达与协作

每个叶子包只负责一个相对明确的知识边界，并可以独立被查询和复用。

## 快速开始

推荐使用 `npx skills` 安装，它可以接入 Claude Code、Cursor、Codex、OpenCode 等 Agent 工具：

```bash
npx skills add https://github.com/konglong87/feeling-to-jargon
```

也可以指定平台，或只安装这个 Skill：

```bash
npx skills add https://github.com/konglong87/feeling-to-jargon --skill feeling-to-jargon --agent codex
```

安装后，可以直接输入类似这样的需求：

```text
删除列表项，5 秒内撤销并支持键盘；撤销时要沿原路径回来。
```

它会帮助你把需求补全为状态机、动画序列、空间锚点、可测参数、可访问性和验收标准，而不只是给出一句“做得顺滑一点”。

## 一次真实的本地查询

在仓库中执行：

```bash
python3 scripts/query-index.py "删除列表项，5 秒内撤销并支持键盘"
```

本次查询只加载了两个叶子包：`terms/interaction/accessibility.json` 和 `terms/interaction/undo-window.json`。结果包括“撤销按钮可读标签”和“轻量状态播报”等条目，并给出键盘可聚焦、只播报关键状态、不每秒重复播报倒计时等约束。

这比一句“加个顺滑的撤销动画”更接近可以实现和检查的规格。以上是 2026 年 10 月 13 日的本地查询结果，不是虚构的产品界面。

## 项目结构

```text
index/       # 根领域、专业子域、用户意图和运行时路由
terms/       # 可独立加载的术语、模式、技巧和模板
skills/      # Agent 加载规则
templates/   # 可复用的 Prompt 与内容模板
scripts/     # 索引查询、校验和渐进式内容生成
```

仓库同时提供本地索引查询和校验脚本，方便在添加新领域后检查索引完整性，并进行端到端查询。

## 为什么把它作为精选项目？

Feeling to Jargon 关注的是 AI 协作里一个经常被忽略的问题：人有感觉，但感觉还不是可执行的规格。

它尝试在“人的直觉”和“专业表达”之间建立一层翻译系统，让产品、设计、工程和 AI 之间的沟通少一点猜测，多一点可选择、可实现、可验证的共同语言。

## 项目链接

- [GitHub 仓库](https://github.com/konglong87/feeling-to-jargon)
- [Skill 说明](https://github.com/konglong87/feeling-to-jargon/blob/main/skills/feeling-to-jargon/SKILL.md)
- [索引查询脚本](https://github.com/konglong87/feeling-to-jargon/blob/main/scripts/query-index.py)
- [MIT License](https://github.com/konglong87/feeling-to-jargon/blob/main/LICENSE)
