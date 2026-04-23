---
name: feature-lifecycle
description: >-
  Feature 端到端开发流程。从讨论到验收，串联所有角色和子 skill。
  触发场景：开始一个新 feature、检查流程是否跳步、确认下一步该谁做什么。
  覆盖：讨论→需求确认→PRD→技术设计→开发→review(架构+PM并行)→合并→部署→QA验收→完成。
---

# Feature Lifecycle

Feature 端到端开发流程。每个阶段有明确的入口条件、产出、负责人和退出条件。

**核心原则：不跳步。每个阶段的退出条件是下一个阶段的入口条件。**

---

## 流程总览

```
讨论 → 需求确认 → PM 出 PRD → 架构师出技术设计 → 开发 → Review（架构+PM 并行）→ 合并 → 部署 staging → QA 验收 → 完成
```

## 全流程遵循

- **git-workflow**：所有文件写操作在 worktree 里，主目录只读
- **project-ops**：任务板实时更新，文档放 `docs/tasks/{TASK-ID}/`

---

## Phase 1: 讨论

**负责人**：建军 + 飞马 + 野马（视情况）

**入口**：有人提出 idea 或需求

**产出**：
- 需求边界明确
- 核心问题回答清楚
- 决策记录到项目频道 + project memory

**退出条件**：建军确认"做这个"

---

## Phase 2: PM 出 PRD

**负责人**：野马

**入口**：需求确认

**子 skill**：`prd-workflow`

**产出**：`docs/tasks/{TASK-ID}/prd.md`

**退出条件**：PRD 推到仓库，在频道通知架构师

---

## Phase 3: 架构师出技术设计

**负责人**：飞马

**入口**：PRD ready

**子 skill**：`tech-designflow`

**产出**：`docs/tasks/{TASK-ID}/design.md`

**退出条件**：设计文档推到仓库，在频道通知开发

---

## Phase 4: 开发

**负责人**：战马

**入口**：技术设计 ready

**子 skill**：`dev-taskflow` + `git-workflow`

**产出**：PR（从 worktree 提交）

**退出条件**：PR 已开，在频道 @ 架构师和 PM 请求 review

---

## Phase 5: Review（架构 + PM 并行）

**负责人**：飞马（代码 review）+ 野马（需求 review）

**并行执行，不互相等待。**

### 架构师 Review（飞马）

**子 skill**：`code-review`

**关注点**：
- 代码质量、架构合理性
- 边界条件、错误处理
- 性能、安全
- 测试覆盖
- 对照设计文档检查实现

### PM Review（野马）

**子 skill**：`pm-review`（野马自建）

**关注点**：
- 功能是否符合 PRD 需求
- 用户体验是否合理
- 边界 case 是否覆盖
- 验收标准是否可验证

### Review 流程

1. 架构师和 PM **各自在 PR 上留评论**
2. 有问题 → 开发修改 → 重新 review
3. 两方都 approve → 进入合并

**退出条件**：架构师 approve + PM approve

---

## Phase 6: 合并

**负责人**：飞马

**子 skill**：`git-workflow`

**规则**：
- ❌ 禁止 `--admin` 跳过 review
- ✅ 等 CI check 通过
- ✅ 等架构师 + PM 两方 approve
- ✅ squash merge

**退出条件**：PR merged

---

## Phase 7: 部署 Staging

**负责人**：飞马

**子 skill**：`devops-taskflow`

**步骤**：
1. 触发 deploy workflow（staging）
2. 确认容器重启拉了新镜像
3. 在频道通知 QA

**退出条件**：staging 运行新代码

---

## Phase 8: QA 验收

**负责人**：烈马

**子 skill**：`project-acceptance`

**步骤**：
1. 按 PRD 验收标准逐条验证
2. 浏览器 + 真机测试（有 UI 的功能）
3. 通过 → 在频道确认；不通过 → 打回开发

**退出条件**：QA 确认通过

---

## Phase 9: 完成

**负责人**：飞马

**步骤**：
1. 更新 BOARD.md（移到 Done / Archive）
2. 更新 project memory
3. 如果需要推 prod → 等建军 approve

---

## 状态检查清单

开始新 feature 时对照：

- [ ] Phase 1: 需求讨论完了？建军确认了？
- [ ] Phase 2: PRD 在仓库里了？
- [ ] Phase 3: 技术设计在仓库里了？
- [ ] Phase 4: PR 开了？
- [ ] Phase 5: 架构师 approve？PM approve？
- [ ] Phase 6: PR merged？
- [ ] Phase 7: Staging 部署了？
- [ ] Phase 8: QA 验收通过？
- [ ] Phase 9: BOARD 更新了？

---

## 反模式

- ❌ 跳过 PRD 直接写设计 → PM 的需求边界没确认
- ❌ 跳过 review 直接合并 → 用 `--admin` 是禁止的
- ❌ 只有架构师 review，PM 没看 → 需求可能偏了
- ❌ 合并后不部署 → staging 和代码不同步
- ❌ QA 没验就推 prod → 线上出问题
- ❌ 在主目录写文件 → 违反 git-workflow
