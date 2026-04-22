---
name: git-workflow
description: >-
  Git 操作规范：所有修改必须走 worktree，不在主目录里改。
  包含分支命名、worktree 流程、提交规范、并行隔离规则。
  触发场景：任何需要创建分支、修改代码、提交 PR 的操作。
---

# Git Workflow — 完整规范

## 核心原则

**主目录（`/workspace/<project>/`）永远保持在 main/master 分支，只读。**
**所有开发在 `.worktrees/<task>/` 里进行。**

## 分支命名

| 类型 | 格式 | 示例 |
|------|------|------|
| 功能 | `feat/<描述>` | `feat/multilang-indexing` |
| 修复 | `fix/<描述>` | `fix/defer-close-leak` |
| 重构 | `refactor/<描述>` | `refactor/state-mgmt` |
| 文档 | `docs/<描述>` | `docs/organize-tasks` |
| 多步骤 | `feat/<id>-step<N>-<描述>` | `feat/hay002-step2-gse` |
| 技术债 | `chore/<描述>` | `chore/test-coverage` |

## Worktree 流程

### 1. 开始新任务

```bash
cd /workspace/<project>
git fetch origin main
git worktree add .worktrees/<task-name> -b <branch-name> origin/main
cd .worktrees/<task-name>
```

**关键**：
- 必须先 `git fetch origin main`，从 `origin/main` 创建
- 不要从本地 main 拉——本地 main 可能是旧的
- worktree 放在 `.worktrees/` 子目录里，不要放上级目录

### 2. 开发 + 提交

```bash
cd /workspace/<project>/.worktrees/<task-name>
# 编辑代码...
git add -A && git commit -m "feat(scope): description"
git push origin <branch-name>
```

### 3. 开 PR

```bash
cd /workspace/<project>/.worktrees/<task-name>
gh pr create --base main --head <branch-name> --title "..." --body "..."
```

### 4. PR 合并后清理

**worktree 在 PR 合并后才删除**——开 PR 后可能还需要修改（review 反馈）。

```bash
# PR 合并后才执行：
cd /workspace/<project>
git worktree remove .worktrees/<task-name>
git branch -d <branch-name>
git pull origin main
```

**不要在 push + 开 PR 后就删 worktree**——review 可能要求改动。

## 提交规范

### Commit Message 格式

```
type(scope): description (#issue)
```

常用 type：`feat`, `fix`, `refactor`, `test`, `docs`, `chore`

### 提交前检查

- [ ] 代码能编译/构建
- [ ] 所有测试通过
- [ ] lint / formatter 通过
- [ ] 自审了 diff
- [ ] 没有硬编码的密钥、ID、内部 URL
- [ ] 不要提交构建产物（`.DS_Store`, `node_modules/`, `__pycache__/`, `coverage/` 等）

## 并行任务隔离

- **每个任务一个 worktree**，名字和分支名对应
- **并行任务各自 worktree 隔离**，互不干扰
- **绝不能主 session 和 subagent 同时操作同一个仓库**
- 完成后各自开 PR，不多个 subagent 抢同一个仓库

## Claude Code 集成

用 Claude Code 执行时，workdir 指向 worktree：

```bash
cd /workspace/<project>/.worktrees/<task-name>
claude --permission-mode bypassPermissions --print '...'
```

**不要** `cd /workspace/<project>` 然后直接改文件。

## 主目录允许的操作

- ✅ `git fetch` / `git pull origin main`
- ✅ `git worktree add` / `git worktree remove`
- ✅ 读文件（`cat`/`grep`/`read`）
- ✅ `git log` / `git status` / `git diff`
- ✅ `git stash`（清理临时状态）

## 禁止操作

- ❌ `git checkout feat/xxx`（在主目录切分支）
- ❌ 在主目录里修改代码然后 commit
- ❌ 多个 subagent 同时在主目录操作 git
- ❌ 从本地 main 创建 worktree（用 `origin/main`）
- ❌ worktree 放在 `.worktrees/` 以外的地方

## .gitignore

每个项目确保 `.gitignore` 包含：
```
.worktrees/
coverage/
node_modules/
```
