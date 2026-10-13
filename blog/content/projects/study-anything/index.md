+++
title = "Study Anything"
date = 2026-10-13T00:00:00+08:00
description = "一个通用学习教练 Skill，用学习校准、主动回忆、苏格拉底式练习和费曼复述，帮助学习者建立可迁移的理解。"
summary = "学习不是看完一段解释，而是能够自己说清楚，并在新情境里用出来。Study Anything 把校准、规划、练习、复习和迁移检查组合成可复用的学习流程。"
project_summary = "把学习从“看懂了”推进到“能复述、能迁移、能用出来”。"
project_language = "Markdown / Shell"
project_status = "持续迭代"
project_order = 3
featured = true
project_kicker = "Learning Coach · Active Recall · Skill"
project_tagline = "不只是讲给你听，而是陪你真正学会。"
repo_url = "https://github.com/konglong87/study-anything"
docs_url = "https://github.com/konglong87/study-anything/blob/main/README.zh-CN.md"
docs_label = "中文说明"
tags = ["项目", "学习", "Skills", "主动回忆"]
+++

## 为什么需要一个学习教练？

AI 可以很快解释一个概念，但解释得流畅，并不意味着学习者已经掌握。读完时觉得“懂了”，换一个例子却说不清楚，这是学习过程中常见的断点。

Study Anything 关注的不是一次输出多少知识，而是让学习者参与思考：先知道自己要学什么、目前会什么，再通过问题、练习、复习和新例子，检查理解是否真的形成。

## 一条从陌生到迁移的学习路径

项目将学习拆成五个环节：

| 环节 | 要解决的问题 |
| --- | --- |
| 校准 | 学习目标是什么？当前水平、时间和约束是什么？ |
| 规划 | 哪几个小单元最值得先学？每个单元完成后能做什么？ |
| 苏格拉底练习 | 通过追问、比较、预测和最小提示，暴露并修正理解中的缺口。 |
| 主动回忆 | 用简短问题重新提取旧知识，而不是反复阅读同一段解释。 |
| 费曼迁移 | 用自己的话复述，并在一个新的例子中应用。 |

它不会在刚提出问题时就立即替学习者给出答案。学习者先尝试，教练再根据尝试提供反馈和下一步动作。

### 类比也需要边界

如果要把陌生知识映射到熟悉领域，先确认学习者确实熟悉那个领域，再明确类比哪里成立、哪里不成立。不能为了让解释好听，就凭空假设学习者的经验。

例如，下面是一条可以尝试的学习请求，而不是已完成学习的证明：

```text
我想学习数据库索引。会基础 SQL，每天有 20 分钟。
请先确认我的目标和水平，再安排小单元；用问题和新例子检查我是否理解。
```

## 两种接入方式

### 普通对话：加载 Skill 即可

普通学习对话直接加载仓库中的 `SKILL.md`，不需要接入特定数据库，也不要求准备应用专属的数据结构。

### 宿主应用：明确输入与输出协议

需要将学习教练嵌入自己的应用时，可以加载更精简的 `runtime.md`，传入 `study_context_v1`，获得 `study_decision_v1`。

运行时可以提出状态变化建议，但**持久化、权限控制和最终校验仍由宿主应用负责**。对话内容不能越过宿主提供的权威状态，替用户修改未获允许的状态。

```text
学习者与宿主状态
    ↓
study_context_v1
    ↓
学习教练 runtime
    ↓
study_decision_v1
    ↓
宿主校验并决定是否保存
```

## 如何开始

可以向支持本地 Skill 的 Agent 提出安装请求：

```text
安装 github.com/konglong87/study-anything 作为本地 Skill。
完成后读取 SKILL.md，并告诉我安装路径和校验结果。
```

这需要客户端能够访问 GitHub，并有权写入自己的 Skill 目录。若客户端不支持自动安装，可以从仓库获取 `dist/study-anything.skill.zip`，按客户端支持的方式导入；具体方式以该客户端的当前文档为准。

仓库提供包校验和可复现打包脚本：

```bash
./scripts/validate-package.sh
./scripts/build-zip.sh
```

打包使用排序后的文件列表与固定时间戳，并附带 SHA-256 校验文件，方便核对分发产物。

## 它与其他精选项目有什么不同？

Anything-AI 提供知识入口，Study Anything 负责“如何把知识学进去”。一个帮助寻找内容，另一个通过对话和练习检查理解，不应把资料索引当作学习效果的替代品。

Skill 也不能保证所有模型、所有客户端产生完全相同的教学效果。真正的验收标准仍然是：学习者能否独立复述、解释边界，并处理新问题。

## 项目链接

- [GitHub 仓库](https://github.com/konglong87/study-anything)
- [中文使用说明](https://github.com/konglong87/study-anything/blob/main/README.zh-CN.md)
- [结构化运行时协议](https://github.com/konglong87/study-anything/blob/main/docs/runtime-contract.md)
- [发布包目录](https://github.com/konglong87/study-anything/tree/main/dist)
