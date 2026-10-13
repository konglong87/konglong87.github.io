# konglong87.github.io

个人博客，使用 Hugo 0.111.3 与固定版本的 [hugo-paper](https://github.com/nanxiaobei/hugo-paper)。GitHub Pages 从 `main` 分支的 `/docs` 发布，访问地址保持为 <https://konglong87.github.io/>。

## 精选项目：手工发布，不自动同步

- `/projects/`：手工挑选的项目集。
- `/projects/go-e2e/`：本地优先的 AI Coding Agent。
- `/projects/feeling-to-jargon/`：感觉到专业术语与可执行 Prompt 的翻译层。

项目 Markdown 位于 `blog/content/projects/<repo>/index.md`。文章、首页摘要与项目列表均以这份文件的 Front Matter 为唯一来源；截图跟随文章放在同一个 leaf bundle 中。仅 `featured = true` 的项目显示在首页第一屏的精选区，生活文章时间线仍只使用 `post`。

后续只有明确指定的项目才创建文章。没有 GitHub 项目扫描、同步脚本、定时任务或自动新增机制。

## 构建

仓库沿用旧版 Hugo，避免无关升级导致历史文章的 Front Matter 不兼容。`blog/theme-version.txt` 固定 Paper 的现有主题版本；构建脚本会安装缺失的主题并拒绝覆盖主题中的本地修改。

```bash
# 需要 Hugo 0.111.3；支持用 HUGO_BIN 指定路径。
HUGO_BIN=/path/to/hugo-0.111.3 ./scripts/build.sh

# 本地验收构建，不更改发布目录。
HUGO_BIN=/path/to/hugo-0.111.3 HUGO_BASEURL=http://127.0.0.1:1313/ \
  ./scripts/build.sh .build/preview
python3 -m http.server 1313 --bind 127.0.0.1 --directory .build/preview

# 验收完成后生成 GitHub Pages 输出；不删除既有静态文章或图片。
HUGO_BIN=/path/to/hugo-0.111.3 ./scripts/build.sh docs
```

日常只构建到 `.build` 或根目录 `docs`，不再生成 `blog/public`、`blog/docs` 或 `docs/public` 的嵌套副本。原有历史副本暂不删除，以避免本次改动牵涉既有数据。

## 验证

浏览器回归测试使用 Playwright，可在已有依赖环境运行；支持 `PLAYWRIGHT_MODULE` 指向已安装的包：

```bash
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node scripts/test-projects.cjs
```

覆盖桌面、紧凑桌面、平板、390px/360px 手机宽度；实际点击导航、项目卡片、返回链接、暗色按钮，检查图片加载、主题持久化、页面横向溢出、重复 ID、脚本错误和内部 404，并回归现有文章与首页分页。测试截图输出到 `.build/acceptance`，不提交。

历史 `exampleSite` 主题示例不参与个人博客构建，避免空菜单和重复菜单；已发布的示例静态 URL 保留，不在本次改动中删除。

## 内容来源

两篇文章基于 2026-10-13 的公开 README 和项目文档整理。go-e2e 的 Desktop 图片来自其公开仓库；Feeling to Jargon 的示例通过本地索引查询验证，不伪造产品界面。头像是原头像文件的本地副本，用来避免外部图床影响新页面加载。
