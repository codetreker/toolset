---
name: bugfix-taskflow
description: >-
  标准 Bug 修复流程：从 issue/bug report 到修复交付的完整 pipeline。
  触发场景：(1) 收到 bug report 或 issue 需要修复，(2) 用户报告问题需要排查，
  (3) 行为偏离预期需要定位根因并修复，(4) CI/测试发现回归需要修复。
  不适用于新功能开发（用 dev-taskflow）。
  流程：issue → reproduce & root cause(CC) → fix plan(CC) → parallel review(CC+Copilot, max 2轮)
  → implement fix + regression test(CC) → code review(CC+Copilot) → 提交架构 review。
---

# Bugfix TaskFlow — 从 Issue 到修复交付

## 流程概览

```
Issue/Bug → [1] Reproduce & Root Cause → [2] Fix Plan → [3] Parallel Review → [4] Fix + Test → [5] Code Review → [6] 提交 Review
              (Claude Code)               (Claude Code)  (CC + Copilot ×2轮)  (CC)            (CC + Copilot)     (架构师)
```

## 前置条件

- 有明确的 bug report / issue（包含复现步骤或错误描述）
- 明确目标仓库和分支
- Claude Code 和 Copilot CLI 可用

## Step 1: Reproduce & Root Cause Analysis

用 Claude Code 复现 bug 并定位根因。**不修，只分析。**

```bash
cd <project-dir> && claude --permission-mode bypassPermissions --print "
读 <issue-path-or-description>。

任务：
1. 理解 bug 的预期行为 vs 实际行为
2. 在代码中定位相关模块和执行路径
3. 写一个最小复现测试（test 应该 FAIL，证明 bug 存在）
4. 追踪根因：从症状到源头，找到具体是哪行代码/哪个逻辑导致的
5. 输出到 <output-path>/root-cause.md，包含：
   - 复现步骤
   - 根因分析（具体到文件:行号）
   - 影响范围（还有哪些地方可能受影响）
   - 复现测试文件路径

约束：
- 不要修复，只分析
- 复现测试必须能跑且 FAIL
- 用 make test-safe 跑测试
"
```

**验收标准：** root-cause.md 包含根因定位（精确到代码位置）+ 一个 FAIL 的复现测试。

## Step 2: Fix Plan

基于根因分析，制定修复方案。

```bash
cd <project-dir> && claude --permission-mode bypassPermissions --print "
读 <output-path>/root-cause.md。

制定修复方案，输出到 <output-path>/fix-plan.md：
1. 修复策略（改什么、怎么改、为什么这样改）
2. 改动文件列表 + 预估改动行数
3. 回归风险评估（这个改动可能破坏什么）
4. 需要补的测试：
   - 复现测试（已有，修复后应 PASS）
   - 边界 case 测试
   - 回归测试（防止复发）
5. 不改什么（明确 scope 边界，不做超出 bug 范围的重构）
"
```

**验收标准：** fix-plan.md 有清晰的改动范围、回归风险、测试计划。

## Step 3: Parallel Review（最多 2 轮）

CC + Copilot 并行 review fix plan，聚焦：
- 根因是否找对了（会不会只治标不治本）
- 修复方案是否引入新问题
- 测试覆盖是否充分
- scope 是否合理（不扩大也不遗漏）

```bash
# Review 1: Claude Code
cd <project-dir> && claude --permission-mode bypassPermissions --print "
Review <output-path>/fix-plan.md 和 <output-path>/root-cause.md。
聚焦：根因是否准确、修复是否治本、是否引入新问题、测试是否充分。
只输出 CRITICAL/HIGH 问题。
输出到 <output-path>/review-cc-round1.md
"

# Review 2: Copilot（同时启动）
cd <project-dir> && copilot -p "
Review <output-path>/fix-plan.md 和 <output-path>/root-cause.md。
聚焦：根因是否准确、修复是否治本、是否引入新问题、测试是否充分。
只输出 CRITICAL/HIGH 问题。
输出到 <output-path>/review-copilot-round1.md
"
```

**修复 → 再 review → 最多 2 轮。** Bug fix 讲速度，2 轮够了。

**验收标准：** 两个 reviewer 都无 CRITICAL 问题。

## Step 4: Implement Fix + Regression Test

TDD 风格：先有 FAIL 的测试，再改代码让它 PASS。

```bash
cd <project-dir> && claude --permission-mode bypassPermissions --print "
按 <output-path>/fix-plan.md 执行修复。

约束：
- 复现测试已存在且 FAIL，先确认它确实 FAIL
- 实现修复代码
- 确认复现测试 PASS
- 补充 fix-plan 中列出的边界 case 和回归测试
- 所有测试通过（make test-safe）
- gofmt -w 格式化
- 每个逻辑改动一个 commit：
  - 第一个 commit：复现测试（如果还没 commit）
  - 第二个 commit：修复代码
  - 第三个 commit：补充测试（边界 + 回归）
- 不要改 fix-plan scope 之外的代码
- 不要 merge
"
```

**验收标准：** 复现测试从 FAIL → PASS，所有测试通过，commit 历史清晰。

## Step 5: Code Review（CC + Copilot）

并行 review 修复代码，聚焦 **根因一致性 + 无副作用**：

```bash
# Review 1: Claude Code
cd <project-dir> && claude --permission-mode bypassPermissions --print "
Code review: 对比 <output-path>/root-cause.md、<output-path>/fix-plan.md 和实际代码改动（git diff origin/main...HEAD）。
聚焦：
1. 修复是否真正解决了根因（不是绕过症状）
2. 是否引入新 bug 或行为变更
3. 测试是否覆盖了根因、边界 case、回归
4. 改动是否超出 scope
只输出 CRITICAL/HIGH 问题。
"

# Review 2: Copilot（同时启动）
cd <project-dir> && copilot -p "
Code review: 对比 fix plan 和实际代码改动（git diff origin/main...HEAD）。
聚焦：根因一致性、副作用、测试充分性、scope 控制。
只输出 CRITICAL/HIGH 问题。
"
```

**修复 CRITICAL 问题后重跑 review（最多 1 轮）。**

**验收标准：** 两个 reviewer 都无 CRITICAL 问题。

## Step 6: 提交架构 Review

1. `git push origin <branch>`
2. `gh pr create`（body 包含 issue 链接 + root-cause.md 摘要 + fix-plan.md 摘要）
3. PR title 格式：`fix(scope): description (#issue)`
4. 在项目频道 @ 架构师请求 review
5. 盯 CI 直到绿灯
6. 等架构师 approve

## 执行要点

- **所有 Claude Code 调用用 shell 直接启动**，不走 ACP
- **并行 review 用 `&` 后台运行**，两个同时跑
- **主 session 只做调度**，不自己写代码（delegate-not-do）
- **每步完成后在频道汇报进度**
- **遇到 OOM/超时**：加大内存/timeout 重试，不要放弃
- **Copilot 用 `-p` 非交互模式**
