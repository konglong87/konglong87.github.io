# konglong87.github.io

个人博客，使用 Hugo 0.111.3 与固定版本的 [hugo-paper](https://github.com/nanxiaobei/hugo-paper)。GitHub Pages 从 `main` 分支的 `/docs` 发布，访问地址保持为 <https://konglong87.github.io/>。

## 精选项目：手工发布，不自动同步

| 文章路径 | 项目 |
| --- | --- |
| `/projects/go-e2e/` | go-e2e：本地优先的 AI Coding Agent |
| `/projects/feeling-to-jargon/` | Feeling to Jargon：感觉到专业术语与 Prompt 的翻译层 |
| `/projects/study-anything/` | Study Anything：以主动回忆和反馈为核心的学习 Skill |
| `/projects/superpm/` | superPM：从需求验证到上线复盘的产品工作流 |
| `/projects/anything-ai/` | Anything-AI：AI 学习资料与实践路线的知识站 |
| `/projects/free-ai-free-token/` | free-AI-free-token：有来源和核验状态的免费额度目录 |
| `/projects/hall-of-fame/` | Hall of Fame：可路由、按需加载的专家视角 Skills |
| `/projects/face-hairstyle-fit/` | Face Hairstyle Fit：隐私优先的发型、妆容与穿搭风格 Skill |

`/projects/` 汇集以上八篇独立文章，首页精选区也展示这八个项目。项目 Markdown 位于 `blog/content/projects/<slug>/index.md`；文章、首页摘要与项目列表均以 Front Matter 为唯一来源。截图随文章存放在同一个 leaf bundle 中，本地图片通过渲染钩子预留宽高，避免下载后正文跳动。

只有 `featured = true` 的项目显示在首页精选区，生活文章时间线仍只使用 `post`。`project_order` 控制精选项目顺序。后续仅为明确指定的项目创建文章，没有 GitHub 项目扫描、同步脚本、定时任务或自动新增机制。新增时同时更新独立验收清单 `scripts/project-fixtures.json`。

## 构建与发布

仓库沿用 Hugo **0.111.3**，避免无关升级导致历史文章不兼容。`blog/vendor/hugo-paper` 保存现有固定版本的主题运行文件及 MIT 许可证，来源和修订记录见其 `UPSTREAM.md` 与 `blog/theme-version.txt`。构建不再下载主题，也不依赖旧的 `blog/themes` 缓存。

```bash
# 需要 Hugo 0.111.3；默认使用 PATH 中的 hugo，也可以明确指定。
HUGO_BIN=/path/to/hugo-0.111.3 ./scripts/build.sh

# 本地验收构建，不更改发布目录。
HUGO_BIN=/path/to/hugo-0.111.3 HUGO_BASEURL=http://127.0.0.1:1313/ \
  ./scripts/build.sh .build/preview
python3 -m http.server 1313 --bind 127.0.0.1 --directory .build/preview

# 验证预览输出。
python3 scripts/check-site.py .build/preview --base-url http://127.0.0.1:1313

# 正式发布：构建 docs → 静态检查 → 提交相关文件 → push origin main。
HUGO_BIN=/path/to/hugo-0.111.3 ./blog/deploy.sh "build: publish selected projects"
```

发布脚本仅允许 `main`，会拒绝已暂存的无关文件，剥离继承的预览 `HUGO_BASEURL`，并以 `konglong <konglong@com>` 提交。构建或检查失败时不提交、不推送。未暂存的无关修改不受影响；没有新改动时仍会尝试推送已有提交。

日常仅构建到 `.build` 或根目录 `docs`，不再生成 `blog/public`、`blog/docs` 或 `docs/public` 的嵌套副本。原有历史副本与静态 URL 暂不删除。

## 验证

```bash
# 静态检查：路由数量、标题、链接、页面元信息 URL、资源和图片宽高。
python3 scripts/check-site.py docs

# 发布安全回归：隔离临时仓库 + 本地 bare remote，不触及正式远端。
python3 scripts/test-deploy.py

# 先启动上述预览服务，再用已安装的 Playwright 运行浏览器验收。
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node scripts/test-projects.cjs
```

浏览器验收覆盖 1920/1440/1024px 桌面、768px 平板、390/360/320px 手机与 844×390 横屏。实际操作导航、八张卡片、相关文章、返回入口、键盘 Enter 和暗色切换；检查主题持久化、受限 localStorage、图片加载、慢图布局稳定性、横向溢出、重复 ID、脚本错误、请求失败、内部 404，并回归原有文章与首页分页。可通过 `TEST_BASE_URL`、`TEST_OUTPUT` 指定服务和截图目录。默认截图及 JSON 报告保存在 `.build/acceptance`，不提交。

历史 `exampleSite` 主题示例不参与个人博客构建，已发布的示例静态 URL 保留。

## 内容来源与边界

已有六篇文章基于 2026-10-13 的公开 README 和项目文档整理；Hall of Fame 文章基于 2026-10-14 的公开 README 和安装说明整理；Face Hairstyle Fit 文章基于 2026-10-14 的公开 README、Skill 和架构说明整理。go-e2e 的 Desktop 图片来自公开仓库；Feeling to Jargon 的示例经过本地索引查询，不伪造产品界面。新增项目文章使用真实架构与使用说明，不杜撰产品截图、用户量或验证结论。

Anything-AI 的知识站是独立 Pages 仓库，不由本博客构建。免费额度文章不收录真实 API key，也不保证模型永久免费、无限额度或始终可用；访问与额度以服务商当时的官方规则为准。
