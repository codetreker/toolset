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
| 项目进度、阻塞 | `memory/projects/{name}/YYYY-MM-DD.md` |
| 项目概述、关键决策 | `memory/projects/{name}/README.md`(**不放看板副本**) |
| 跨项目个人笔记 | `memory/YYYY-MM-DD.md` |
| 任务文档(设计、决策、review) | 项目仓库 `docs/tasks/{TASK-ID}/` |
| **讨论阶段文档**(方案未定、repo 未建) | `/workspace/_drafts/{项目名}/` |
| 站会纪要 | `oc-shared/docs/standup/` |

### 原则

- 项目 memory 是工作日志，仓库 docs/ 是正式文档
- **`/workspace/_drafts/` 是讨论阶段的临时文档区**（方案未定、repo 未建时用），方案确定后必须移到正式项目目录
- 不混放——不同项目的笔记不混在同一个文件
- 不重复——一个事实只记一个地方

---

## Session 启动上下文

1. 读 MEMORY.md + `memory/YYYY-MM-DD.md`(今天+昨天)
2. 如果在项目频道:读 `memory/projects/{name}/README.md` + 当天笔记
3. 读最近频道消息

### 新项目 Memory 初始化

加入一个新的项目频道时,检查 `memory/projects/{name}/` 是否存在:
- 存在 → 直接读取
- 不存在 → 按 `references/memory-readme-template.md` 创建 `memory/projects/{name}/README.md`

---

## 频道使用规则

- 项目讨论**必须在专属频道**,不在 #general
- 没有专属频道 → 先创建再讨论
- 不要串频道
