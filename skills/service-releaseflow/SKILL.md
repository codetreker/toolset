---
name: service-releaseflow
description: >-
  服务发布流程：从 PR merged 到 production 部署完成。
  触发场景：PR 合并后需要部署到 staging/prod、QA 需要做 staging E2E 回归测试、需要推 prod。
  覆盖：Deploy staging → QA staging E2E 完整回归测试 → Approve → Deploy prod → Prod 验证。
  前置条件：PR 已合并（feature-developflow 完成）。
---

# Service Release Flow

服务发布流程，从 PR merged 到 production 部署完成。每个阶段有明确的入口条件、产出、负责人和退出条件。

**核心原则：staging 必须先过 QA 完整 E2E 回归测试，才能推 prod。没有例外。**

> 本 skill 覆盖发布生命周期（PR merged → prod 验证完成）。
> 开发生命周期（讨论 → PR merged）见 **feature-developflow** skill。

---

## 流程总览

```
PR merged → Deploy staging → QA staging E2E 回归 → Approve → Deploy prod → Prod 验证 → 完成
```

---

## Phase 1: Deploy Staging

**负责人**：飞马

**入口**：PR merged（feature-developflow Phase 7 完成）

**子 skill**：`devops-taskflow`

**步骤**：
1. 触发 deploy workflow（staging 环境）
2. 确认容器重启拉了新镜像
3. 确认 staging 服务启动正常（健康检查通过）
4. **部署完成后立刻自动通知 QA（烈马）做 E2E 回归**——不需要人工提醒，飞马部署完直接 @ QA

**通知模板**：
```
@烈马 staging 已部署完成，请做 E2E 回归测试。
- 部署内容：{PR 标题/任务描述}
- staging 地址：{URL}
- 验收标准：参考 PRD + 全量回归
```

**退出条件**：staging 部署成功 + QA 已通知

---

## Phase 2: QA Staging E2E 回归测试

**负责人**：烈马

**入口**：staging 部署完成 + 收到飞马通知

**子 skill**：`project-acceptance`

### ⚠️ 铁律：E2E 必须浏览器 + 截图

**严禁用 curl、API 调用、HTTP 状态码检查替代 E2E 验收。**

- ✅ 必须用浏览器打开 staging 环境
- ✅ 必须截图记录每个验收点
- ✅ 必须走完整用户流程（从入口到出口）
- ❌ `curl -s https://staging.xxx | grep 200` 不是 E2E
- ❌ API 返回 200 不代表页面能正常渲染和交互

### 测试范围

1. **新功能验收**：按 PRD 验收标准逐条验证
2. **回归测试**：确保已有功能没有被破坏
   - **必须按项目的测试用例清单完整逐项跑，不允许简化脚本替代**
      - 不能自己写简化版跳过用例——测试用例清单存在的意义就是防止漏验
   - 教训（2026-04-26）：QA 跑了十几个简化用例就报通过，漏掉 WS 断连和权限泄漏两个 P0
3. **跨浏览器/设备**（有 UI 的功能）：至少 Chrome + 一个移动端

### ⚠️ 铁律：截图里任何异常 = 自动 ❌

**截图里任何红色/黄色异常提示（横幅、错误、断连、警告）= 验收不通过。**
不管觉得是不是测试环境问题，红色横幅/错误提示/连接断开 = ❌。不放过任何视觉异常。

### 产出

- 验收报告（通过/不通过 + 截图证据）
- 不通过 → 详细说明问题 + 截图 → 打回开发（回到 feature-developflow 修复）

### 退出条件

QA 确认 staging E2E 通过（含截图证据）

---

## Phase 3: Approve & Deploy Prod

**负责人**：飞马 + 建军

**入口**：QA staging E2E 通过

**步骤**：
1. 飞马确认 QA 验收报告
2. 需要建军 approve 时 → 通知建军并等待确认
3. 触发 prod deploy workflow
4. 确认容器重启拉了新镜像
5. 确认 prod 服务启动正常（健康检查通过）

**规则**：
- 首次部署新服务 / 重大变更 → 必须建军 approve
- 常规 bugfix / 小改动 → 飞马可自行推 prod（但需记录）

**退出条件**：prod 部署完成

---

## Phase 4: Prod 验证 & 完成

**负责人**：飞马 + 烈马

**步骤**：
1. 飞马做 smoke test（服务健康、核心 API 正常）
2. 烈马做 prod 快速验证（浏览器打开 prod 确认关键流程正常，截图）
3. 更新 BOARD.md（任务移到 Done / Archive）
4. 更新 project memory

**退出条件**：prod 验证通过 + BOARD 更新

---

## 状态检查清单

PR merged 后对照：

- [ ] Phase 1: Staging 部署了？QA 通知了？
- [ ] Phase 2: QA E2E 通过了？有截图？
- [ ] Phase 3: 建军 approve 了（需要时）？Prod 部署了？
- [ ] Phase 4: Prod 验证通过？BOARD 更新了？

---

## 反模式

- ❌ Staging 没测就推 prod → 线上出问题
- ❌ 用 curl/API 替代浏览器 E2E → 页面渲染/交互问题漏掉
- ❌ QA 没截图就说"通过了" → 没有证据的验收等于没验收
- ❌ 部署 staging 后忘记通知 QA → 流程卡住等人工提醒
- ❌ 跳过 prod 验证 → 部署了但没人确认是否正常
- ❌ 合并后不部署 → staging 和代码不同步
- ❌ BOARD 不更新 → 任务状态不可追踪
