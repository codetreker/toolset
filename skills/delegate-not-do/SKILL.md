---
name: delegate-not-do
description: >-
  Low-priority execution guide: decides HOW to execute a task (spawn subagent vs do inline),
  not WHAT to do. Activates only when no other skill claims the task.
  If a specialized skill applies (coding-agent for code tasks, task-dispatch for
  non-trivial ops, tech-designflow for design docs, etc.), follow that skill instead.
  This skill covers the residual: generic delegation decisions and subagent spawning mechanics.
  NOT for: simple single-file reads, one-shot quick answers, trivial edits under 5 lines,
  or pure conversational replies.
---

# 委派，不要亲自干

## ⚠️ 优先级：本 skill 是兜底

**本 skill 的优先级低于所有其他 skill。** 它只在没有更专业的 skill 适用时才激活。

### 路由规则（先检查这些，再回到本 skill）

| 任务类型 | 应该用的 skill | 本 skill 的角色 |
|---------|--------------|---------------|
| 写代码、review PR、重构 | `using-claude-code` / `using-codex` | 不介入——直接 exec background 跑 coding agent，不需要套 subagent |
| 架构设计、方案调研、技术选型 | `tech-designflow` | 不介入 |
| 非 trivial 有副作用操作（改配置、建频道、部署等） | `common-taskflow`（调研→Review→执行） | 不介入——common-taskflow 自己管流程 |
| Code Review | `code-review` | 不介入 |
| 项目启动/归档 | `project-init` | 不介入 |
| 以上都不匹配的非 trivial 执行任务 | **本 skill** | 指导怎么 spawn subagent |

### ⚠️ Coding agent ≠ subagent

**跑 Claude Code / Codex 不需要套 subagent。** 它们自己就是异步执行的：

- Interactive session → `exec background=true` 跑 coding agent，直接异步
- 不要 spawn subagent 再在里面跑 coding agent——多一层嵌套没有任何好处
- 只有当任务需要**思考 + 编排**（不只是跑 coding agent）时才 spawn subagent

### 本 skill 的角色定义

本 skill **只管执行方式**（spawn subagent vs 自己做），**不管任务内容**：

- ✅ 判断一个任务应该 spawn 还是自己做
- ✅ 指导 subagent 的派工质量（目标、验收标准、约束）
- ✅ 指导 subagent 结果处理（转达、修正、重试）
- ❌ 不决定用什么工具/流程完成任务（那是其他 skill 的事）
- ❌ 不替代 coding-agent、task-dispatch 等 skill 的工作流

## 核心原则

你的主 session 是**指挥台**，不是工位。

- **你（主 session）**：接收消息、做决策、派任务、汇报结果
- **subagent**：具体执行——写代码、改配置、分析日志、跑长命令、读文件分析

## 工兵信号（出现任何一个 → 立刻停下，打包给 subagent）

- **连续工具调用 ≥ 3 轮**（read → read → exec → ...）
- **"先看看这个再看看那个"** — 典型滑坡
- **操作超过 1 分钟没出结果** — 任务本身就该委派
- **"做了第一步，做完算了"** — 沉没成本陷阱

## 什么时候 spawn subagent

| 自己做 | spawn subagent |
|--------|---------------|
| 回复一句话 / 轻量沟通 | 读多个文件做分析 |
| 基于已有上下文做决策 | 写代码 / 大量修改 |
| 读启动/流程文件加载上下文 | 跑测试 / 编译 / git 操作 |
| 发消息、react | 复杂排查 / 搜索调研 |
| | 批量配置修改 / 写长文档 |
| | 任何预计 > 1 分钟的操作 |

**犹豫 = spawn。** 犹豫本身说明任务不够轻量。

> **注意**：上表只判断"spawn 还是自己做"。具体用什么工具/流程，看路由规则表。
> 比如"写代码"确实要 spawn，但 spawn 的方式由 `coding-agent` skill 决定，不是本 skill。

## 借口粉碎机

| 借口 | 正确做法 |
|------|---------|
| "这个很快" / "就读一个文件确认一下" | 你预估从来不准，一个文件会变五个。永远 spawn，哪怕只需 30 秒 |
| "spawn 太浪费了" | subagent 成本 < 主 session 阻塞成本。阻塞 = 所有频道无响应 |
| "人在等，spawn 太慢" | spawn 同时回复"查一下，马上回"。自己做也要等，还可能做错重来 |
| "都做了一步了，做完算了" | 沉没成本谬误。**立刻停下**，把已知上下文塞进 subagent 让它接手 |
| "Subagent 超时/失败了，我来做吧" | 超时说明任务更重，加大超时或 spawn 新的。永远不自己接手 |

## 怎么派 subagent

好的派工：
- 明确目标："把 XXX 文件里的 A 改成 B，跑测试确认通过"
- 明确验收标准："测试全过、lint 通过、commit message 包含 issue 号"
- 明确约束："不要改 XXX 以外的文件"、"用 HTTPS 不用 SSH"

坏的派工：
- "去把这个搞好"（目标不明确）
- "参考 XXX 做一下"（没有验收标准）
- 一次塞太多不相关的事（应该拆成多个 subagent）

注意事项：
- subagent 写大文件容易因 JSON 截断失败，大文件用 exec + heredoc 更可靠

## subagent 结果处理

- **成功** → 转达给相关人，不要让结果沉默
- **质量不达标** → 给明确反馈 spawn 新 subagent 修正，不要自己改
- **超时/失败** → 加大超时或拆分任务重新 spawn，不要自己接手
- **多个并行 subagent** → 各自独立，结果到齐后统一汇报

## 铁律

0. **Heartbeat 巡检 → spawn subagent** — heartbeat 触发时 spawn subagent 执行巡检是正确做法。主 session 不直接巡检，但要确保 subagent 被 spawn 出去。
1. **人类消息 > 一切任务** — 收到人类消息立刻响应，不要因为 subagent 在跑就不理人
2. **主 session 不阻塞** — spawn 完 subagent 就继续待命，不要同步等
3. **干活 → spawn** — 沟通协调以外的事都不是你的活

## 自检（第 2 次连续工具调用时触发）

> **你在做沟通协调，还是动手干活？干活 → spawn subagent。**
