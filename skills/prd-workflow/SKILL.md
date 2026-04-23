---
name: prd-workflow
description: PRD 撰写流程。用于：编写新 feature PRD、产品需求文档、方向文档。触发场景：(1) 收到 PRD 撰写任务，(2) 新 feature 需要写需求文档，(3) Backlog 任务需要产品定义。前置依赖 git-workflow skill。
---

# PRD 撰写流程

## 前置检查（硬规则）

1. **遵循 git-workflow**：主目录只读，所有文件写操作在 worktree 中
   ```bash
   cd /workspace/<project>
   git worktree add .worktrees/docs-<task-id> -b docs/<task-id>
   # 在 .worktrees/docs-<task-id>/ 里写 PRD
   ```
2. 确认任务 ID，PRD 路径：`docs/tasks/<TASK-ID>/prd.md`

## 流程

1. **理解需求**：读 BOARD.md、相关 direction.md、讨论记录
2. **写 PRD**：按模板填写（见下方）
3. **提交**：worktree 里 commit + push → 开 PR → 通知飞马 review
4. **更新 BOARD**：文档列加 `[prd]` 链接（也在 worktree 里改）
5. **通知频道**：PRD 完成，@ 飞马出技术设计

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
## 成功指标
```

## 禁止

- ❌ 在主目录写文件
- ❌ PRD 里写技术实现细节（那是设计文档的事）
- ❌ 跳过需求确认直接让开发动手
