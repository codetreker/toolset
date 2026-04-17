---
name: ready-for-review
description: >
  文档浏览与 PR Review 服务（review.codetrek.work）。用于：(1) 生成设计文档/任务板/spec 的
  review 链接发给团队，(2) 查看 PR diff，(3) 浏览项目文档，(4) 放置 draft 文件供人类 review。
  触发词：review 链接、文档浏览、PR diff、draft review、ready for review。
---

# Ready for Review

让团队在手机上随时 review Markdown 文档和 PR diff。

## 服务信息

- **域名**: `review.codetrek.work`
- **本地端口**: 4800
- **代码**: `/workspace/ready-for-review/`
- **认证**: Cloudflare Access（OTP）

## URL 格式

### 文档浏览

```
https://review.codetrek.work/doc/{project}/{path-to-file.md}
```

- `{project}` = `/workspace/` 下的目录名
- `{path-to-file.md}` = 项目目录内的相对路径

示例：
- `https://review.codetrek.work/doc/haystack/docs/tasks/BOARD.md`
- `https://review.codetrek.work/doc/syntrix/docs/design-v1.md`

### PR Review

```
https://review.codetrek.work/prs/{owner}/{repo}          — PR 列表
https://review.codetrek.work/pr/{owner}/{repo}/{number}   — PR 详情 + diff
```

URL 中 `{owner}/{repo}` 支持两种格式：
- **斜杠格式**（推荐）：`codetreker/haystack`
- **双横线格式**：`codetreker--haystack`（向后兼容）

示例：
- `https://review.codetrek.work/prs/codetreker/haystack`
- `https://review.codetrek.work/pr/codetreker/haystack/42`

### 其他路由

- `/project/{name}` — 项目文件树
- `/raw/{project}/{path}` — 原始 Markdown
- `/api/projects` — 项目列表 JSON
- `/health` — 健康检查

## 项目发现机制

服务每 30 秒扫描 `/workspace/` 下的目录。识别条件（满足任一）：

1. 包含 `docs/` 子目录
2. 包含 `README.md`
3. 包含 `docs/tasks/BOARD.md`
4. **2 层深度内有任何 `.md` 文件**

排除的目录：`node_modules`, `.git`, `tmp`, `oc-wiki`, 以 `.` 开头的目录。

> **注意**：`_drafts` 目录不再被排除，放在 `/workspace/_drafts/` 下的文件可以被发现和浏览。

## Draft 文件（供人类 Review）

当需要让人类 review 草稿文档（设计文档、配置变更方案等）时：

### 放置位置

**推荐**：放到 `/workspace/_drafts/{draft-name}/`：

```
/workspace/_drafts/{draft-name}/
├── README.md          # 方案说明
├── design.md          # 实际要 review 的文件
└── other-files.md     # 其他相关文件
```

**备选**：放到 `/workspace/ready-for-review/{draft-name}/`（也可以）。

命名规则：目录名用 kebab-case，描述性命名（如 `heartbeat-simplify`, `haystack-design-v2`）。

### 生成 Review URL

```
# _drafts 方式
https://review.codetrek.work/doc/_drafts/{draft-name}/design.md

# ready-for-review 方式
https://review.codetrek.work/doc/ready-for-review/{draft-name}/design.md
```

### 发给人类

```
方案文档已准备好，请 review：
https://review.codetrek.work/doc/_drafts/heartbeat-simplify/design.md
```

### Review 完成后清理

```bash
rm -rf /workspace/_drafts/{draft-name}/
```

## 使用场景速查

| 场景 | 做法 |
|------|------|
| 设计文档 review | 放到 `_drafts/`，发 review 链接 |
| 任务板查看 | 直接链接 `/doc/{project}/docs/tasks/BOARD.md` |
| PR review | 用 `/prs/{owner}/{repo}` 或 `/pr/{owner}/{repo}/{number}` |
| 项目文档浏览 | 直接链接 `/doc/{project}/{path}` |

## QA 验收流程

PR 合并后需要 QA 验收时：

1. **启动临时服务**（如果验收需要运行中的服务）
2. **浏览器打开验收**：用 review 链接或实际服务 URL 在浏览器中验证
3. **截图确认**：所有带 UI 的验收必须截图，curl 状态码不算 e2e 验收
4. **逐条检查验收标准**：对照设计文档的验收标准逐项验证
5. **结论**：通过 → 确认；不通过 → 打回开发并说明具体问题

## 注意事项

- 文件修改后刷新页面即可看到最新内容（无构建步骤）
- 只渲染 `.md` 文件
- safePath 校验防止路径穿越，symlink 不被允许
