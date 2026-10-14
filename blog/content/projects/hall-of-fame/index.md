+++
title = "Hall of Fame"
date = 2026-10-14T00:00:00+08:00
description = "一个面向 AI 编程工具的专家视角 Skills 集合，通过关键词与 LLM 分类，把不同问题路由到合适的思维框架。"
summary = "Hall of Fame 将教育、产品、创业、投资、学习、写作、法理等方向的专家视角整理成可安装的 Skills，并用路由和按需加载减少上下文噪声。"
project_summary = "把多领域专家视角组织成可路由、可按需加载的 AI Skills。"
project_language = "Markdown / Shell"
project_status = "持续迭代"
project_order = 7
featured = true
project_kicker = "Expert Perspectives · Skills · Routing"
project_tagline = "遇到不同问题，先找到合适的思考方式。"
repo_url = "https://github.com/konglong87/hall-of-fame"
docs_url = "https://github.com/konglong87/hall-of-fame/blob/main/README.md"
docs_label = "项目说明"
tags = ["项目", "AI", "Skills", "专家视角", "路由"]
+++

## 为什么需要专家视角？

同一个问题，换一个思考框架，得到的关注点可能完全不同：产品问题需要看用户和增长，创业问题需要看验证和约束，学习问题需要检查是否真的理解，风险问题则要先想想哪里会失效。

Hall of Fame 把这些思考框架整理成可以被 AI 编程工具加载的 Skills，并用智能路由把问题送到合适的入口。它不是一个名人语录库，也不是让模型假装成某位真实人物，而是把公开资料中提炼出的分析方法、表达习惯和适用场景组织成可复用的工作入口。

## 一组可路由的专家 Skills

仓库按领域组织了多组专家视角，覆盖教育升学、产品增长、创业商业、投资财富、思维学习、写作思考、传统智慧、法理正义和 AI 技术等方向。

每个专家目录通常有自己的 `SKILL.md`，里面说明适用场景、核心方法、表达特征和诚实边界。使用者可以根据任务选择一个视角，也可以让路由器先帮忙判断应该从哪里开始。

下面是几类典型入口：

| 问题方向 | 可以借用的视角 | 适合先检查什么 |
| --- | --- | --- |
| 产品与增长 | 张一鸣、MrBeast、乔布斯 | 用户价值、分发、体验和执行反馈 |
| 创业与商业 | Paul Graham、马斯克 | 问题是否真实、约束在哪里、如何迭代验证 |
| 投资与决策 | 查理·芒格、Naval | 认知偏误、激励结构、能力圈和杠杆 |
| 学习与风险 | 费曼、塔勒布 | 是否真的理解、哪些假设可能失效 |
| 写作与法理 | 王小波、罗翔 | 论证、表达、事实与价值判断的边界 |

这些视角是分析工具，不是结论替代品。涉及升学、投资、法律、医疗或真实商业投入时，仍需要核对事实并由使用者做最终判断。

## 核心机制：先路由，再加载

Hall of Fame 的关键不在于把所有专家内容一次性塞进上下文，而在于把选择过程拆成两层：

1. **关键词匹配**：先扫描问题中的领域词和场景词，计算匹配程度；达到阈值时直接选择对应方向。
2. **LLM 分类**：关键词不足以判断时，再让模型在候选方向中进行分类；无法确定时回退到默认入口。

选定方向后，系统才动态加载对应的专家 `SKILL.md`。这样可以减少 context 污染，也让一次请求只携带与当前任务有关的规则和表达约束。

```text
用户问题
    ↓
关键词匹配
    ↓ 置信度不足
LLM 分类
    ↓
选择专家视角
    ↓
动态加载对应 SKILL.md
    ↓
生成带有视角约束的分析
```

仓库还提供 `SessionStart Hook`，用于在会话开始时注入 Skill 的能力说明，让使用者知道有哪些专家入口以及如何调用，而不必每次重新查目录。

## 如何使用

以支持 Skills 的 AI 编程工具为例，可以先安装仓库，再按照目标客户端的方式建立 Skill 链接。Codex 的安装说明是：

```bash
git clone https://github.com/konglong87/hall-of-fame.git ~/.codex/hall-of-fame
mkdir -p ~/.agents/skills
ln -s ~/.codex/hall-of-fame ~/.agents/skills/hall-of-fame
```

重启客户端后，可以用自然语言提出问题，也可以直接使用 `/hall-of-fame` 入口，例如：

```text
/hall-of-fame "我的产品增长停滞，应该先看什么？"
/hall-of-fame "怎么验证自己真的理解了一个概念？"
/hall-of-fame "这个方案有哪些脆弱点？"
```

项目提供 Claude Code、Cursor、Codex 和 OpenCode 等客户端的安装说明，但不同客户端的 Skill、插件和 Hook 机制并不完全相同，实际安装路径应以仓库当前文档为准。

## 诚实边界

Hall of Fame 的专家框架基于公开资料整理。它们**不是对应专家本人发布的观点，也不代表本人认可或参与了这个项目**。角色化表达可以帮助模型切换分析角度，但不能把这种表达当成身份认证、事实来源或专业资质。

路由器也可能判断错误：一个问题可能同时属于产品、创业和风险，关键词匹配会受措辞影响，LLM 分类也会产生不确定性。重要任务应明确问题、补充背景、核对引用，并对输出做反例检查。

## 为什么把它作为精选项目？

这个项目把“请换个角度想想”变成了可安装、可复用的工具结构：专家资料有目录边界，路由规则可检查，Skill 按需加载，客户端入口有安装说明。

它和 [superPM](/projects/superpm/)、[Study Anything](/projects/study-anything/) 可以形成互补：superPM 组织产品工作的流程，Study Anything 关注学习和迁移，Hall of Fame 则提供面对不同问题时的思考视角。三者都不能替代事实核验和人的最终判断。

## 项目链接

- [GitHub 仓库](https://github.com/konglong87/hall-of-fame)
- [安装与使用说明](https://github.com/konglong87/hall-of-fame/blob/main/README.md)
- [Codex 安装说明](https://github.com/konglong87/hall-of-fame/blob/main/.codex/INSTALL.md)
- [主 Skill](https://github.com/konglong87/hall-of-fame/blob/main/SKILL.md)
