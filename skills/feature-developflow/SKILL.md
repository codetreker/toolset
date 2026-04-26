---
name: feature-developflow
description: >-
  Feature 开发流程：从讨论到 PR 合并。串联所有角色和子 skill，覆盖完整开发生命周期。
  触发场景：开始一个新 feature、检查开发流程是否跳步、确认下一步该谁做什么。
  覆盖：讨论→需求确认→PRD→UI线框图→技术设计→开发→Review（架构+PM并行）→QA test 环境验收→PR合并。
  结束于 PR merged。部署到 staging/prod 请用 service-releaseflow。
---

# Feature Development Flow

Feature 开发流程，从讨论到 PR 合并。每个阶段有明确的入口条件、产出、负责人和退出条件。

**核心原则：不跳步。每个阶段的退出条件是下一个阶段的入口条件。**

> 本 skill 覆盖开发生命周期（讨论 → PR merged）。
> 部署和发布流程见 **service-releaseflow** skill。

---

## 流程总览

```
讨论 → 需求确认 → PM 出 PRD → PM 出 UI 线框图 → 架构师出技术设计 → 开发 → Review（架构+PM 并行）→ QA test 环境验收 → PR 合并
```

## 全流程遵循

- **git-workflow**：一任务一分支，PRD/设计/开发/测试全程在同一分支，任务完成后才合并
- **project-ops**：任务板实时更新，文档放 `docs/tasks/{TASK-ID}/`
- **任务开始 = 创建分支**：进入 Phase 2（PRD）时创建任务分支，分支名记入 BOARD.md

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

## Phase 2.5: PM 出 UI 线框图

**负责人**：野马

**入口**：PRD ready，且功能涉及 UI

**子 skill**：`mockup-ui`

**产出**：`docs/ui/{TASK-ID}/` 下的线框图（至少是页面布局 + 按钮位置 + 间距比例）

**规则**：
- 所有有 UI 的功能必须有线框图，不需要高保真但必须让 dev 知道页面长什么样
- 线框图需要建军确认后才进入技术设计
- 不涉及 UI 的纯后端功能可以跳过此步

**退出条件**：线框图推到仓库，建军确认

---

## Phase 3: 架构师出技术设计

**负责人**：飞马

**入口**：PRD ready + UI 线框图 ready（有 UI 的功能）

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

**铁律：Review 必须对照设计文档（design doc）的每一条要求逐条检查，任何跳过或遗漏都是严重失职。**

- 第一步读设计文档，不是读 diff
- 设计文档里的验收标准、功能点、约束条件、测试覆盖率要求，逐条在代码中找对应实现
- 输出完整 Spec 对照表，不允许省略任何一条
- 设计文档要求覆盖率 ≥ X% / 集成测试 / coverage 工具，PR 没有就打回
- 不能只 review 当前 PR 的 diff——必须检查设计文档的全量要求有无遗漏的功能/测试/基建

教训（2026-04-26）：Go server 重写 review 时只盯了 json tag 修复，没有对照设计文档检查，导致整套测试覆盖（设计文档明确要求 ≥85%）和 coverage 工具完全遗漏。

**其他关注点**：
- 代码质量、架构合理性
- 边界条件、错误处理
- 性能、安全

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
3. 两方都 approve → 进入 QA 验收

**退出条件**：架构师 approve + PM approve

---

## Phase 6: QA Test 环境验收

**负责人**：烈马

**入口**：架构师 approve + PM approve

**子 skill**：`project-acceptance`

**步骤**：
1. **在本地 test 环境基于任务分支验收**（合并前）
2. 按 PRD 验收标准逐条验证
3. 浏览器 + 真机测试（有 UI 的功能）
4. 通过 → 允许合并；不通过 → 打回开发

**退出条件**：QA 确认通过

---

## Phase 7: 合并

**负责人**：飞马

**子 skill**：`git-workflow`

**规则**：
- ❗ **必须等所有环节完成才合并**：QA 本地 test 环境验收通过 + 架构师 review 通过
- ❌ 禁止 `--admin` 跳过 review
- ❌ 禁止讨论中的 PR 合并
- ✅ 等 CI check 通过
- ✅ squash merge

**退出条件**：PR merged

> PR merged 后，部署到 staging/prod 请走 **service-releaseflow** skill。

---

## Bug 修复流程（简化）

Bug 不需要 PRD 和设计文档，直接建分支开始修复。

```
建分支（BOARD 记录）→ 开发修复 → code review → QA test 环境验收 → 合并 → deploy
```

- 分支命名：`fix/bug-0XX-<desc>`
- 跳过 Phase 1-3（讨论/PRD/设计），直接进 Phase 4（开发）
- 其余流程不变：code review + QA 验收必须过

---

## 状态检查清单

开始新 feature 时对照：

- [ ] Phase 1: 需求讨论完了？建军确认了？
- [ ] Phase 2: PRD 在仓库里了？
- [ ] Phase 2.5: UI 线框图 ready？（有 UI 的功能）
- [ ] Phase 3: 技术设计在仓库里了？
- [ ] Phase 4: PR 开了？
- [ ] Phase 5: 架构师 approve？PM approve？
- [ ] Phase 6: QA test 环境验收通过？
- [ ] Phase 7: PR merged？

---

## 反模式

- ❌ 跳过 PRD 直接写设计 → PM 的需求边界没确认
- ❌ 有 UI 的功能跳过线框图直接写代码 → dev 不知道 UI 该长什么样，结果一堆 UX 问题
- ❌ 跳过 review 直接合并 → 用 `--admin` 是禁止的
- ❌ 只有架构师 review，PM 没看 → 需求可能偏了
- ❌ Review 不对照设计文档 → 遗漏测试覆盖、功能缺失等硬伤
- ❌ QA 没验就合并 → 带着 bug 进主分支
- ❌ 在主目录写文件 → 违反 git-workflow
- ❌ PR merged 后不走 service-releaseflow → staging 和代码不同步
