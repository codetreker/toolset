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

## ❗ 一任务一分支，全程不合并

**一个任务从开始到结束只用一条分支。**

- 任务开始（PRD/设计讨论阶段）就创建分支，分支名记入 BOARD.md
- PRD、设计文档、代码实现、bug 修复、测试——全部在这条分支上 commit + push
- **中间不合并到 main**：每完成一步可以 commit + push（保存进度），但 PR 不合并
- **合并条件**：所有环节完成（QA 本地 test 环境验收通过 + 代码 review 通过）才合并
- 合并后关闭 task，清理 worktree 和分支

## 分支命名

| 类型 | 格式 | 示例 |
|------|------|------|
| 功能 | `feat/<task-id>` | `feat/b07-slash-commands` |
| 修复 | `fix/<task-id>` | `fix/bug-020-auth` |
| 技术债 | `chore/<task-id>` | `chore/b13-orm` |

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

### 4. 任务完成后合并 + 清理

**合并条件**：QA 本地 test 环境验收通过 + 代码 review 通过。

```bash
# 所有环节通过后才执行：
cd /workspace/<project>/.worktrees/<task-name>
gh pr merge <pr-number> --squash

# 清理：
cd /workspace/<project>
git worktree remove .worktrees/<task-name>
git branch -d <branch-name>
git pull origin main
```

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

## Coding Agent 集成

用 coding agent（Claude Code / Codex）执行时，workdir 指向 worktree。
调用方式见 `using-coding-agent` skill。

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

### 定期清理 Worktree

PR 合并后必须清理 worktree。如果发现残留 worktree：

```bash
cd /workspace/<project>
git worktree prune          # 清理已删除目录的记录
rm -rf .worktrees/<name>/   # 删除残留目录
```

教训（2026-04-26）：Borgee 项目积累了 17 个残留 worktree，占用磁盘且容易混淆。
