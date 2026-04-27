---
name: common-workflow
description: 非 trivial 任务的标准执行流程：先调研拿方案，review 后再执行。当人类说「我要 review」时，设计阶段推到 ready-for-review 仓库并给 doc 链接，PR 阶段直接给 PR 链接。触发场景：需要创建频道、修改配置、修复环境、部署服务等有副作用的非 trivial 操作。不适用于：只是读文件查信息、简单改一个文件等 trivial 操作。
---

# Task Flow

标准流程：**调研 → Review → 执行**。

## 判断是否需要本流程

- **需要**：创建频道、修改配置、修复环境、写代码、部署服务、批量操作等有副作用的非 trivial 任务
- **不需要**：读文件查信息、简单改一个文件、查状态等 trivial 操作（直接做）

## 谁来做调研

用 coding agent（Claude Code / Codex）作为执行 agent。调用方式见 `using-coding-agent` skill。

## 流程

### Phase 1: 调研

1. 生成 task-id：`YYYYMMDD-简短描述`（如 `20260416-fix-engineering-team`）
2. Run claude code，任务描述必须包含：
   - 明确说明**只调研不执行**
   - 调研完把结果写到 `~/.openclaw/subagents/_tasks/{task-id}.md`
   - 文件格式见下方模板
3. 等 subagent 完成

**调研铁律**：不做任何写操作（不改现有文件、不执行变更命令、不发消息）。唯一允许的写操作是创建 task 文件本身。

#### Task 文件模板

```markdown
# Task: {task-id}

## 状态: 调研完成

## 背景
为什么要做这件事，上下文是什么。

## 调研发现
读了什么文件、查了什么信息、现状是什么。

## 执行方案

### Step 1: ...
### Step 2: ...
（每步要具体到命令或操作）

## 风险
可能出什么问题，回滚方案是什么。

## 预期结果
做完之后应该是什么状态。
```

### Phase 2: Review（双审机制）

**同时派 2 个 agent 做独立 review**，尽量用不同的 coding agent（如 Claude Code + Codex），避免单一模型盲区。

#### 流程

1. **同时 spawn 2 个 review agent**
   - 每个 agent 读 `~/.openclaw/subagents/_tasks/{task-id}.md`
   - 各自独立给出 review 结论（不互相看对方的结果）
   - Review 检查项：
     - 每步是否合理？有没有遗漏？
     - 风险评估是否充分？
     - 预期结果是否明确可验证？
2. **结论汇总**
   - 两个结论一致 → 你做最终决策
   - 有疑点或分歧 → 可以继续派 agent 做深入调研
3. **最多 3 轮 review**（不能无限循环）
   - 第 1 轮：双审独立 review
   - 后续轮次（如需要）：针对分歧点深入调研
   - 3 轮后必须收敛，你做最终决策
4. **综合决策**
   - 批准 → 将状态改为 `已批准`，进入 Phase 3
   - 调整 → 直接修改 task 文件，标注调整理由
   - 打回 → 将状态改为 `打回`，附打回原因，重新进入 Phase 1

#### 当人类说「我要 review」时

根据当前阶段提供不同的 review 入口：

- **设计阶段**（调研方案待审）→ 把 task 文件 / 设计文档推到 `ready-for-review` 仓库，给人类 **GitHub 文件链接**（如 `https://github.com/codetreker/ready-for-review/blob/main/{目录}/{文件}`），方便在 GitHub 上直接阅读和评论
- **PR 阶段**（代码已提交待审）→ 直接给 **PR 链接**（如 `https://github.com/codetreker/{repo}/pull/{number}`）

### Phase 3: 执行

1. Spawn 新的 agent（coding agent），任务描述必须包含：
   - 指向 task 文件路径：`~/.openclaw/subagents/_tasks/{task-id}.md`
   - 明确说明**严格按方案逐步执行**
   - 执行完更新 task 文件状态为 `已完成` 或 `部分完成`
2. 等 subagent 完成
3. 验证结果是否符合预期

**执行 agent 铁律**：严格按方案走，发现偏差先停下来报告，不要自作主张。

## 铁律总结

1. 不确定的事先调研，确认了再执行
2. 调研 agent 只读不写（除 task 文件本身）
3. 执行 agent 严格按方案走，偏差即停
4. 每个 task 有完整的文件记录，可追溯
