---
name: dev-taskflow
description: >-
  标准开发流程：从 spec 文档到代码交付的完整 pipeline。
  触发场景：收到设计文档/spec 后需要实现编码、收到飞马派的开发任务、
  需要按标准流程开发并提交 PR。
  流程：spec → task breakdown(CC) → parallel review(CC+Copilot, max 3轮)
  → execute(CC team mode) → code review(CC+Copilot vs spec) → 提交架构 review。
---

# Dev TaskFlow — 从 Spec 到代码交付

## 流程概览

```
Spec 文档 → [1] Task Breakdown → [2] Parallel Review → [3] Execute → [4] Code Review → [5] 提交 Review
              (Claude Code)      (CC + Copilot ×3轮)  (CC team)    (CC + Copilot)     (架构师)
```

## 前置条件

- 有明确的 spec/设计文档（路径或内容）
- 明确目标仓库和分支
- Claude Code 和 Copilot CLI 可用

## Step 1: Task Breakdown

用 Claude Code 把 spec 分解为可执行的 task list。

```bash
cd <project-dir> && claude --permission-mode bypassPermissions --print "
读 <spec-path>，分解为可执行的 task list。

要求：
- 每个 task 独立可验证（有明确的完成标准）
- 按依赖顺序排列
- 每个 task 标注：改哪些文件、预估行数、验证方式
- 输出到 <output-path>/task-breakdown.md
"
```

**验收标准：** task-breakdown.md 包含编号的 task 列表，每个 task 有清晰的 scope 和验证方式。

## Step 2: Parallel Review（最多 3 轮）

Claude Code 和 Copilot **并行** review task list，聚焦：
- 是否遗漏了 spec 中的需求
- task 粒度是否合适（太大拆分，太小合并）
- 依赖顺序是否正确
- 是否有技术风险未标注

**并行启动两个 review（用 `exec background:true`，各自拿 sessionId 后 `process poll` 等结果）：**

```bash
# Review 1: Claude Code
cd <project-dir> && claude --permission-mode bypassPermissions --print "
Review <task-breakdown.md>，对照 <spec-path>。
聚焦：遗漏需求、粒度、依赖、技术风险。
只输出需要修改的 CRITICAL/HIGH 问题，不要废话。
输出到 <output-path>/review-cc-round1.md
"

# Review 2: Copilot（同时启动）
cd <project-dir> && copilot -p "
Review <task-breakdown.md>，对照 <spec-path>。
聚焦：遗漏需求、粒度、依赖、技术风险。
只输出需要修改的 CRITICAL/HIGH 问题，不要废话。
输出到 <output-path>/review-copilot-round1.md
"
```

**修复 → 再 review → 最多 3 轮：**
1. 收集两份 review 的 CRITICAL/HIGH 问题
2. 用 Claude Code 修复 task-breakdown.md
3. 再次并行 review
4. 无 CRITICAL 问题则结束，否则继续（最多 3 轮）

**验收标准：** 两个 reviewer 都无 CRITICAL 问题。

## Step 3: Execute（Claude Code Team Mode）

用 Claude Code 按 task list 顺序执行编码。

```bash
cd <project-dir> && claude --permission-mode bypassPermissions --print "
按 <task-breakdown.md> 顺序执行所有 task。

约束：
- 每完成一个 task 立即 commit（message 包含 task 编号）
- 用 make test-safe 跑测试（Docker，同时只 1 个容器）
- gofmt -w 格式化
- 不要 merge，只 commit 到当前分支
- 遇到阻塞问题停下来，不要猜
"
```

**注意：** 对于大型任务，用 `--resume` 或拆分成多次调用。

**验收标准：** 所有 task 完成，测试通过，代码已 commit。

## Step 4: Code Review（CC + Copilot vs Spec）

编码完成后，并行跑两个 code review，聚焦 **spec 一致性**：

**并行启动两个 code review（同样用 `exec background:true`）：**

```bash
# Review 1: Claude Code
cd <project-dir> && claude --permission-mode bypassPermissions --print "
Code review: 对比 <spec-path> 和实际代码改动（git diff origin/main...HEAD）。
聚焦：
1. spec 中的每个需求是否都实现了
2. 实现是否偏离 spec（多做了或少做了）
3. 边界条件和错误处理是否符合 spec
只输出 CRITICAL/HIGH 问题。
"

# Review 2: Copilot（同时启动）
cd <project-dir> && copilot -p "
Code review: 对比 <spec-path> 和实际代码改动（git diff origin/main...HEAD）。
聚焦：spec 一致性、遗漏实现、偏离设计。
只输出 CRITICAL/HIGH 问题。
"
```

**修复 CRITICAL 问题后重跑 review（最多 1 轮）。**

**验收标准：** 两个 reviewer 都无 CRITICAL 问题。

## Step 5: 提交架构 Review

1. `git push origin <branch>`
2. `gh pr create` 开 PR（body 包含 spec 链接 + task breakdown 链接）
3. 在项目频道 @ 架构师请求 review
4. 盯 CI 直到绿灯
5. 等架构师 + 建军 approve

## 执行要点

- **所有 Claude Code 调用用 shell 直接启动**，不走 ACP
- **并行 review 用 `&` 后台运行**，两个同时跑
- **主 session 只做调度**，不自己写代码（delegate-not-do）
- **每步完成后在频道汇报进度**
- **遇到 OOM/超时**：加大内存/timeout 重试，不要放弃
- **Copilot 用 `-p` 非交互模式**
