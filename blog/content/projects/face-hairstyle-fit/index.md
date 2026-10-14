+++
title = "Face Hairstyle Fit"
date = 2026-10-14T00:00:00+08:00
description = "一个 privacy-first 的个人风格 Agent Skill，根据用户照片与偏好探索发型、妆容和穿搭方向，不做颜值评分或身份推断。"
summary = "Face Hairstyle Fit 把风格建议拆成可解释、可尝试、可调整的方案：先检查照片与约束，再选择风格方向，最后协调发型、妆容和近脸穿搭。"
project_summary = "从照片和偏好出发，探索适合自己的发型、妆容和穿搭风格。"
project_language = "Python / Markdown"
project_status = "实验性"
project_order = 8
featured = true
project_kicker = "Personal Style · Privacy-first · Agent Skill"
project_tagline = "不是给你打分，而是帮你找到可尝试的风格方向。"
seo_title = "Face Hairstyle Fit：隐私优先的个人风格 AI Skill | KongLong"
lastmod = 2026-10-14T00:00:00+08:00
project_audience = "希望根据照片和偏好探索发型、妆容与近脸穿搭方向的人。"
project_boundary = "不做人脸识别、颜值评分、人口属性推断或医疗诊断，视觉结论需要用户反馈验证。"
repo_url = "https://github.com/konglong87/face-hairstyle-fit"
docs_url = "https://github.com/konglong87/face-hairstyle-fit/blob/main/README.md"
docs_label = "项目说明"
tags = ["项目", "AI", "Skills", "穿搭", "发型", "隐私"]
+++

## 从“我适合什么”开始，而不是从颜值打分开始

很多人想换发型、妆容或穿搭，却很难把模糊的感觉说清楚：是脸周轮廓和发型不协调，还是近脸颜色、领口和整体整理感没有形成统一表达？

Face Hairstyle Fit 把这个问题做成一个面向视觉 Agent 的 Skill。它根据用户提供的照片、偏好和生活约束，先观察可见信息，再提出一个主风格和必要的备选方向，最后把方向拆成发型、妆容、穿搭和低成本试验。

它不做颜值评分，也不把用户固定成某个身份标签。目标不是判定“你是什么类型”，而是帮助你找到一套可以解释、可以尝试、可以根据反馈调整的造型方案。

## 一条从照片到试验的咨询流程

项目把咨询拆成几个有边界的步骤：

1. **检查输入**：确认是否为单人照片、脸部是否可见、姿态和光线是否足够，并区分用户照片、参考图和预期效果图。
2. **先观察再命名**：把可见的轮廓转折、脸周发型、妆容和领口分开描述，不把服装、背景或截图文字当成天生特征。
3. **给出风格候选**：提出一个主方向和可选备选，说明依据、取舍与不确定性，不制造虚假的概率或“最适合”结论。
4. **结合现实约束**：考虑发长、发质、打理时间、妆容偏好、穿衣场景和预算，优先给出可逆的小改变。
5. **协调三个模块**：分别给出发型、妆容和穿搭建议，再说明如何组合成一套完整表达。
6. **低成本验证**：明确先试什么、在什么条件下比较，以及下一轮需要用户反馈什么。

```text
照片与偏好
    ↓
检查可用性和信息边界
    ↓
观察可见特征
    ↓
风格候选与理由
    ↓
发型 / 妆容 / 穿搭配方
    ↓
低成本试验与反馈
```

## 用三层风格模型避免混为一谈

仓库将风格词拆成三类，而不是把所有标签当成互斥分类：

| 层级 | 作用 | 示例 |
| --- | --- | --- |
| 基础风格 family | 描述主要造型气质 | 甜美、柔和、端庄大气、清冷、轻熟 |
| 表达方向 expression | 描述造型语言 | 韩系、日系、新中式 |
| 组合配方 recipe | 组合多个视觉方向 | 甜酷、柔和法式、典雅新中式 |

项目还用七个维度描述一套造型：线条、结构、明暗对比、色彩深浅、鲜艳度、装饰量和修饰精度。这些维度描述的是**当前或计划中的造型**，不是永久的脸部测量值，也不是颜值分数。

例如，建议可以落到分缝、刘海、发长、纹理、近脸颜色、领口、材质和配饰，而不是只给一个抽象标签。韩系、日系和新中式在这里是造型表达方向，不是对用户国籍、族裔或身份的判断。

## 数据结构和工具边界

Skill 的规则数据集中在 `references/catalog.json`，维度锚点在 `references/dimensions.md`，输入输出契约由 `schemas/` 定义。脚本负责目录校验、报告契约校验和静态 HTML 展示，**不执行图像分析、不读取照片，也不联网**。

报告有三种状态：

- `ready`：照片和信息足够，可以给出仍然主观的风格建议。
- `provisional`：存在光线、滤镜或约束不确定性，需要明确限制并提出下一步问题。
- `needs_input`：缺少可用照片、目标人物不明确或脸部不可见，不给出确定的个人风格结论。

推荐结果需要绑定风格 family，可选 expression 和 recipe，并分别说明依据、取舍以及发型、妆容、穿搭三个模块的动作。这样既方便视觉 Agent 使用，也方便通过 JSON Schema 和测试工具检查报告是否完整。

## 如何运行校验工具

项目要求 Python 3.9+，可以使用 `uv` 创建环境：

```bash
uv venv .venv
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/python -m unittest discover -s tests -v
.venv/bin/python scripts/skill_tools.py check-catalog
.venv/bin/python scripts/skill_tools.py check-report examples/provisional-report.json
```

如果需要将合法报告渲染成不加载远程资源的静态 HTML，可以运行：

```bash
.venv/bin/python scripts/skill_tools.py render \
  examples/provisional-report.json \
  --output artifacts/example.html
```

真正的视觉理解依赖宿主提供图像能力。这个仓库提供的是咨询流程、风格目录、契约和质量门禁，不是假装拥有一个独立的识图模型。

## 隐私和诚实边界

项目把隐私边界写进 Skill 和贡献流程：不要把真人照片、面部 embedding、个人报告、API Key 或私钥提交到 Git；不要未经授权调用其他图像 API 或上传材料；本地生成带真人内容的 QA 文件后，验收完成应删除临时派生文件。

它也明确不做人脸识别、跨图片身份匹配、颜值排名、年龄/性别/族裔/健康/性格推断、医美或医疗诊断。只有脸部照片时，穿搭建议限制在领口、近脸颜色、材质和整体方向，不推测体型。

这些边界很重要：风格建议是可以试验的造型配方，不是关于一个人的事实判断。效果图只是目标方案的参考，也不能当作用户原生脸部的证据。

## 为什么把它作为精选项目？

Face Hairstyle Fit 把一个很容易滑向外貌评判的问题，拆成了可追溯的输入角色、观察证据、风格目录、输出状态和隐私规则。它不承诺给出唯一答案，而是把建议变成低成本、可逆、可以根据反馈继续调整的试验。

它和 [Study Anything](/projects/study-anything/)、[Hall of Fame](/projects/hall-of-fame/) 也有互补关系：Study Anything 负责通过练习确认是否真的学会，Hall of Fame 提供切换思考视角的 Skills，Face Hairstyle Fit 则把视觉风格探索组织成一套有边界的 Agent 工作流。

## 项目链接

- [GitHub 仓库](https://github.com/konglong87/face-hairstyle-fit)
- [项目说明](https://github.com/konglong87/face-hairstyle-fit/blob/main/README.md)
- [主 Skill](https://github.com/konglong87/face-hairstyle-fit/blob/main/SKILL.md)
- [架构说明](https://github.com/konglong87/face-hairstyle-fit/blob/main/docs/architecture.md)
