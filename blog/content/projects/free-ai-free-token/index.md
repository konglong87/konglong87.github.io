+++
title = "free-AI-free-token"
date = 2026-10-13T00:00:00+08:00
description = "免费 LLM 供应商、模型与 API 接入资料库，用供应商独立目录整理官方来源、模型信息、接入步骤和核验状态。"
summary = "free-AI-free-token 将分散的供应商入口和 API 接入说明整理为可追溯资料库。免费额度、模型状态和客户端兼容性需按供应商当前规则核验，不分发真实凭据。"
project_summary = "整理免费模型与 API 接入资料，保留官方来源和核验状态。"
project_language = "Markdown / Shell"
project_status = "持续更新"
project_order = 6
featured = true
project_kicker = "LLM Providers · API Integration · Documentation"
project_tagline = "免费信息要可追溯，接入过程要有边界。"
repo_url = "https://github.com/konglong87/free-AI-free-token"
docs_url = "https://github.com/konglong87/free-AI-free-token/tree/main/providers"
docs_label = "浏览供应商"
tags = ["项目", "AI", "LLM", "API", "资料库"]
+++

## 它是什么，不是什么？

free-AI-free-token 是一个免费 LLM 供应商、模型与 API 接入资料库。它将官网、文档、模型信息、接入地址和客户端配置步骤整理到一起，减少寻找入口和比对资料的重复劳动。

**它不是公开 API key 集合，也不承诺任何模型永久免费、无限额度或持续可用。** “免费”可能对应限额、试用、特定模型或需要满足条件的方案，必须以供应商当前控制台、条款和官方说明为准。

## 一个供应商，一个独立目录

项目的基本组织边界是 `providers/<provider-slug>/`。每个供应商保留相对独立的说明：

| 文件 | 记录什么 |
| --- | --- |
| `README.md` | 供应商总览、适用场景与快速开始 |
| `official-links.md` | 官网、控制台、文档来源与核验记录 |
| `models.md` | 模型信息、能力描述、上下文和限制 |
| `api.md` | 接入地址、鉴权、兼容性与错误处理 |
| `integrations/` | 不同 Agent / Coding Client 的接入说明 |

根 README 主要承担导航职责，具体信息放在供应商目录中。这样一家供应商的更新，不需要改动其他供应商的说明，也更容易进行独立 review。

## 收录信息，不等于已经验证

供应商文档区分了几种状态：

- **待核验**：已经找到公开资料，但没有完成亲测。
- **已核验**：有相应的实际核验记录。
- **部分可用**：部分 API 或客户端接入已确认，其他部分仍有边界。
- **失效**：保留历史记录，提示相关信息已不能按原方式使用。

即使一份文档曾经核验成功，也不意味着今天一定仍然有效。应一起查看核验日期、来源和当前服务状态，而不能只看“支持”两个字。

## 更稳妥的查阅流程

```text
从仓库导航选择供应商
    ↓
查看官方来源和核验日期
    ↓
确认模型、免费条件、限流与费用规则
    ↓
通过官方渠道自行申请凭据
    ↓
按 api.md 和 integrations/ 完成最小接入
    ↓
检查实际响应、错误、用量和账单
```

项目的价值在于整理过程与入口，而不是替供应商提供服务。实际接入仍需要用户确认自己的客户端协议、模型 ID、地址和权限。

## 内容边界与凭据安全

仓库只收集公开、可追溯的信息，不收录真实 API key、token、cookie、账号信息或敏感截图。

使用时也应遵守同样的边界：

- 通过官方渠道获取自己的凭据，不使用来路不明的共享密钥。
- 不把凭据提交到 Git，也不在公开日志或截图中暴露。
- 核对免费条件、配额和可能产生的费用，必要时设置自己的预算限制。
- 不将“协议兼容”推断为所有功能、所有客户端均已验证。
- 发送敏感代码或个人数据前，先确认服务的数据处理规则。

这篇介绍没有调用模型 API，也没有重新实测供应商额度；具体可用性需要在实际接入时验证。

## 如何参与维护

新增供应商时，从固定模板开始，补齐来源、模型说明、API 和客户端接入文档：

```bash
cp -R providers/_template providers/<provider-slug>
./scripts/validate-layout.sh
```

其中 `<provider-slug>` 是要替换的目录名占位符。公开贡献不应包含任何真实凭据。

与单纯收集链接相比，可审阅的目录结构、核验记录和明确的未知状态，更有利于长期维护。

## 为什么把它作为精选项目？

这是一个围绕实际接入问题整理资料的项目：入口在哪里、信息是否可信、协议如何配置、哪些能力尚未核验。

它可以与 Coding Agent 和 Skills 配合使用，但服务可靠性、模型质量、用量限制和费用规则仍由各供应商决定。选择服务时，需要自己做最终判断。

## 项目链接

- [GitHub 仓库](https://github.com/konglong87/free-AI-free-token)
- [供应商目录](https://github.com/konglong87/free-AI-free-token/tree/main/providers)
- [资料库架构](https://github.com/konglong87/free-AI-free-token/blob/main/docs/architecture.md)
- [贡献指南](https://github.com/konglong87/free-AI-free-token/blob/main/docs/contribution-guide.md)
