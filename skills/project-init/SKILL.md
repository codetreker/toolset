---
name: project-init
description: >
  项目启动、归档与交接。覆盖：新项目初始化（创建频道→注册→项目 memory→仓库 docs/→任务板→TRACKER 登记）、
  项目归档流程、开发交接清单。
  支持两种任务板：GitHub Project Board 和文件 BOARD.md，初始化时自动检测或询问用户选择。
  模板见 references/templates.md。
  适用于：(1) 启动新项目，(2) 归档已完成项目，(3) 开发交接，(4) 需要查模板格式。
---

# 项目启动、归档与交接

---

## 新项目启动

流程：`讨论阶段(可选) → 确定项目 → 创建频道 → 注册频道 → 初始化仓库 docs/ → 设置任务板 → 登记 TRACKER`

### 讨论阶段（_drafts）

当项目还在方案讨论期、技术选型未定、git repo 还没建出来时：

1. 在 `/workspace/_drafts/{项目名}/` 下放讨论文档（设计草稿、方案对比、会议纪要等）
2. 创建项目频道照常进行（讨论也需要频道）
3. **一旦方案确定、repo 建好**，把 `_drafts/{项目名}/` 下的文档移到 `/workspace/{项目名}/docs/`，然后删除 `_drafts` 下的目录

`_drafts/` 是临时讨论区，不是正式项目目录。Ready for Review 等文档浏览服务应排除此目录。

### 正式启动

1. **创建项目频道**：`#project-{项目名}`（小写、短横线），必须 private，**必须放到 `projects` 分类下**（分类 ID：`1493140163042349157`）
2. **注册到频道表**：创建后立刻注册到 `oc-shared/TEAM-DIRECTORY.md`，不要等
3. **初始化仓库 docs/**：`docs/tasks/` 目录
   - 任务相关文档（设计、决策、review）放 `docs/tasks/{TASK-ID}/`，如 `docs/tasks/RFR-001/design.md`
4. **设置任务板**：见下方「任务板初始化」
5. **登记 TRACKER.md**：添加项目条目

所有模板见 `references/templates.md`。

---

## 任务板初始化

### 检测逻辑

初始化时按以下顺序检测：

1. 检查 GitHub org（`codetreker`）是否已有关联此仓库的 Project：
   ```bash
   gh project list --owner codetreker --format json
   ```
   如果找到 → 使用 **GitHub Project Board**

2. 检查仓库是否已有 `docs/tasks/BOARD.md`：
   如果存在 → 使用**文件 BOARD.md**

3. 都不存在 → **询问用户**想用哪种

### 方式 A：GitHub Project Board

适用于：老板需要在 GitHub UI 上直接查看/拖拽任务状态的项目。

**初始化步骤：**

1. 创建 GitHub Project（如果不存在）：
   ```bash
   gh project create --owner codetreker --title "{项目名}"
   ```

2. 配置 6 列状态字段（Backlog → Ready → In Progress → In Review → Done → Archive）：
   ```bash
   # 查看字段和选项 ID
   gh project field-list <PROJECT_NUMBER> --owner codetreker
   ```
   手动在 GitHub UI 配置 Status 字段的 6 个选项，或通过 API 设置。

3. 记录 Project 信息到频道注册表：
   - 任务板列填 `codetreker/projects/<N>`

**日常操作参考：**

```bash
# 创建 Issue
gh issue create --repo codetreker/<REPO> --title "feat: ..." --body "..."

# 添加 Issue 到 Project
gh project item-add <PROJECT_NUMBER> --owner codetreker --url <ISSUE_URL>

# 移动状态
gh project item-edit --project-id <PID> --id <ITEM_ID> \
  --field-id <FIELD_ID> --single-select-option-id <OPTION_ID>

# 查看所有 item
gh project item-list <PROJECT_NUMBER> --owner codetreker --format json
```

### 方式 B：文件 BOARD.md

适用于：轻量级项目，不需要 GitHub Project UI。

**初始化步骤：**

1. 创建 `docs/tasks/BOARD.md`（模板见 `references/templates.md`）
2. 记录到频道注册表：
   - 任务板列填 `docs/tasks/BOARD.md`

---

## 项目归档

1. 频道注册表状态改 `archived`
2. 归档频道（不删——可能需要回查）
3. 项目 memory 保留，README.md 标注归档时间和原因
4. 任务板确认所有任务状态正确
5. 仓库代码和文档已 push

---

## 开发交接

### 交出方

1. 所有 WIP 代码 push 到仓库
2. 在项目频道发交接说明：当前进度、未完成的事、已知问题
3. 更新设计文档中的状态
4. 更新任务板状态（BOARD.md 或 GitHub Project）

### 接手方

1. 读设计文档，理解整体方案
2. 读最近的频道讨论，了解上下文
3. `git log` 看最近的 commit 了解进度
4. 确认能编译、能跑测试
5. 在频道确认接手，说明计划

### Team Lead

1. 更新通讯录
2. 在频道宣布交接
3. 确认接手方能正常工作后才算交接完成
