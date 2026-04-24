---
name: prd-workflow
description: PRD 撰写流程。用于：编写新 feature PRD、产品需求文档、方向文档。触发场景：(1) 收到 PRD 撰写任务，(2) 新 feature 需要写需求文档，(3) Backlog 任务需要产品定义。前置依赖 git-workflow skill。
---

# PRD 撰写流程

## 前置检查（硬规则）

1. **一个任务一条分支**：任务开始时（PRD 讨论阶段）创建分支，分支名从 BOARD.md 的 Branch 列获取
   ```bash
   cd /workspace/<project>
   # 使用任务分支（如果已存在）或创建新的
   git worktree add .worktrees/<task-id> -b <branch-name>
   # 在 .worktrees/<task-id>/ 里写 PRD
   ```
2. **PRD 在任务分支上写，不单独开 PR 合并**：commit + push 到任务分支，这条分支会贯穿整个任务生命周期（PRD → 设计 → 开发 → QA），只有全部完成后才合并 main
3. 确认任务 ID，PRD 路径：`docs/tasks/<TASK-ID>/prd.md`

## 流程

1. **理解需求**：读 BOARD.md、相关 direction.md、讨论记录
2. **写 PRD**：按模板填写（见下方）
3. **涉及 UI 的功能必须同时出 UI 设计稿**：
   - ASCII 线框图放 `docs/ui/<功能名>.md`
   - PRD 里加链接：`## UI 设计稿` → `[线框图](../../ui/<功能名>.md)`
   - 不出 UI 设计稿的 PRD 不算完成（纯后端功能除外）
4. **提交**：worktree 里 commit + push（保存进度，但 **不合并 PR**——等整个任务完成后统一合并）
5. **更新 BOARD**：文档列加 `[prd]` 链接（也在 worktree 里改）
6. **通知频道**：PRD 完成，@ 飞马出技术设计

## PRD 模板

```markdown
# <TASK-ID>: <任务名> — PRD

日期：YYYY-MM-DD | 状态：Draft

## 背景
## 目标用户
## 核心需求
### 需求 N: {名称}
- 用户故事：作为 [角色]，我想 [做什么]，以便 [目的]
- 验收标准：[ ] 具体可验证的条件
## 不在范围
## UI 设计稿
> 涉及 UI 时必填，纯后端可略
- [线框图](../../ui/<功能名>.md)
## 成功指标
```

## 禁止

- ❌ 在主目录写文件
- ❌ PRD 里写技术实现细节（那是设计文档的事）
- ❌ 跳过需求确认直接让开发动手
- ❌ PRD 写完就单独合并 PR（必须等整个任务完成后统一合并）
- ❌ 为 PRD 单独开分支（使用任务统一分支）
