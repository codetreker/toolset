---
name: project-ops
description: 项目操作手册,覆盖:项目 memory 组织与初始化、session 启动上下文加载、任务板规则、频道使用规则。
---

# Project Ops

项目 memory 与任务板的管理手册。所有角色通用。

---

## 频道注册表

- 位置:`oc-shared/TEAM-DIRECTORY.md`,**single source of truth**
- 不要在多个地方维护频道信息--只在注册表里改
- 频道 ID 必须记录--@ 和读消息都需要真实 ID
- 状态要及时更新--项目结束了标 `archived`

---

## 任务板规则

- 位置:每个项目仓库 `docs/tasks/BOARD.md`,不搞全局混合看板
- **BOARD.md 是任务状态的唯一 SOT(Single Source of Truth)**
- **不允许在其他地方维护任务看板副本**--项目 README.md、频道消息、memory 日志都不放看板表格
  - 项目 README.md 只写项目概述和关键决策,任务状态统一看 BOARD.md
  - 频道消息只是通知,不是记录
- **Owner** = 此刻球在谁手上,随状态流转变化
- **所有任务必须有 Owner,无主任务不允许存在**
- 任务完成、状态变更、子任务拆分--**第一时间更新任务板**,不是"回头再改"

### 状态流转

6 列看板:Backlog → Ready → In Progress → In Review → Done → Archive

| 状态 | 含义 | 谁操作 |
|------|------|--------|
| **Backlog** | 待评估的任务池 | 任何人创建 |
| **Ready** | 已审批,可以开发 | **老板**审批 |
| **In Progress** | 开发中 | **总管**分配任务时移入 |
| **In Review** | PR 已提交,等 review | **开发**提 PR 后移入 |
| **Done** | PR 已合并 | 合并后移入 |
| **Archive** | 人类验收完毕 | **仅老板操作** |

**规则:**
- Agent 只从 Ready 列取任务,不自行从 Backlog 取
- P0 紧急 bug 例外:可直接进 Ready,同时通知老板
- Done 不是阻塞点--agent 做完就继续下一个 Ready 任务,不等 Archive

### 任务文档

每个任务(尤其是非 trivial 的任务)的相关文档放在项目仓库 `docs/tasks/{TASK-ID}/` 下:

```
docs/tasks/
├── BOARD.md              # 看板(唯一 SOT)
├── HAY-004/
│   ├── design.md         # 设计文档 / 技术方案
│   ├── decision.md       # 决策记录(选型、trade-off)
│   └── review.md         # Review 结论
├── SMI-001/
│   └── design.md
└── ...
```

- **设计文档**(design.md):技术方案、架构图、接口定义
- **决策记录**(decision.md):选型理由、trade-off、开放问题和结论
- **Review 结论**(review.md):代码 review 发现的问题和处理结果
- Trivial 任务(一句话能说清的 bug fix 等)可以不建目录,BOARD.md 里备注即可
- **任务文档跟着任务走**--任务 Done/Archive 后文档保留,不删除

---

## 项目 Memory 组织

### 什么放哪里

| 内容 | 位置 |
|------|------|
| 项目详细日志 | `memory/projects/{name}/YYYY-MM-DD.md` |
| 项目概述 + 重要决策/里程碑/经验教训 | `memory/projects/{name}/README.md`(**不放看板副本**) |
| 跨项目个人笔记 | `memory/YYYY-MM-DD.md` |
| 任务文档(设计、决策、review) | 项目仓库 `docs/tasks/{TASK-ID}/` |
| **讨论阶段文档**(方案未定、repo 未建) | `/workspace/_drafts/{项目名}/` |
| 站会纪要 | `oc-shared/docs/standup/` |

### 原则

- 项目 memory 是工作日志,仓库 docs/ 是正式文档
- **`/workspace/_drafts/` 是讨论阶段的临时文档区**(方案未定、repo 未建时用),方案确定后必须移到正式项目目录
- 不混放--不同项目的笔记不混在同一个文件
- 不重复--一个事实只记一个地方

---

## Session 启动上下文

1. 读 MEMORY.md + `memory/YYYY-MM-DD.md`(今天+昨天)
2. 如果在项目频道:读 `memory/projects/{name}/README.md` + 最近 2 天的 daily notes（今天+昨天）
3. 读最近频道消息

### 新项目 Memory 初始化

加入一个新的项目频道时,检查 `memory/projects/{name}/` 是否存在:
- 存在 → 直接读取
- 不存在 → 按 `references/memory-readme-template.md` 创建 `memory/projects/{name}/README.md`

---

## 项目 Memory 写入规则

**Channel session 必须主动记录重要信息到 project memory。**不要等別人来问"进展如何"--信息应该已经在文件里了。

### 写入时机

以下事件发生时,**立刻**写入 `memory/projects/{name}/YYYY-MM-DD.md`:

| 事件类型 | 示例 | 必须记录 |
|----------|------|----------|
| **决策确认** | 建军拍板方案 A、技术选型确认、需求变更 | ✅ |
| **任务状态变更** | 任务开始、PR 提交、PR 合入、验收通过/打回 | ✅ |
| **阻塞与解除** | 卡在 X 了、等 Y 的回复、阻塞已解除 | ✅ |
| **设计变更** | 接口改了、架构调整、原来的方案被推翻 | ✅ |
| **Bug 发现与修复** | 发现 P0/P1 bug、根因分析、修复确认 | ✅ |
| **里程碑完成** | Phase 完成、整个任务收工 | ✅ |
| **经验教训** | 踩坑、反直觉的行为、值得备忘的细节 | ✅ |
| 日常对话、闲聊 | "好的""收到""这个不错" | ❌ 不记 |
| 常规进度确认 | "还在跑""快好了" | ❌ 不记 |

### 写入格式

```markdown
## HH:MM UTC - 事件标题

- 具体内容(谁做了什么、结论是什么、为什么)
- 如果是决策,记录决策人和理由
- 如果是阻塞,记录等什么、谁负责解除
```

### README.md vs Daily Notes

**README.md = 精华汇总**：项目概述 + 重要决策 + 里程碑 + 设计变更 + 经验教训。新人读完能快速了解项目现状和来龙去脉。

**Daily notes = 详细日志**：每天发生了什么，具体过程、上下文、谁做了什么。可以相对详细。

| 内容 | README.md | Daily notes |
|--------|:---------:|:-----------:|
| 项目描述、技术栈、团队 | ✅ | |
| 重要决策及理由 | ✅ | ✅ 详细过程 |
| 里程碑完成 | ✅ | ✅ 详细过程 |
| 设计变更 | ✅ | ✅ 详细过程 |
| 经验教训 | ✅ | ✅ 详细过程 |
| 任务状态变更、阻塞、bug | | ✅ |
| 日常进度、对话 | | ❌ 不记 |

简单说：README 记「什么是重要的」，daily notes 记「今天发生了什么」。

### 约束

- **宁多勿漏**:不确定该不该记,先记下来。文件便宜,丢信息贵。
- **实时记录**:事件发生当时就写,不要"等一下再补"。
- **不重复**:任务状态在 BOARD.md,project memory 记的是**上下文和原因**,不是再维护一份状态副本。
- **不制造垃圾**:"收到""好的"这种消息不记入文件。

---

## 频道使用规则

- 项目讨论**必须在专属频道**,不在 #general
- 没有专属频道 → 先创建再讨论
- 不要串频道
