---
name: e2e-acceptance
description: >-
  项目 e2e 验收流程。验收在合并前进行——QA 本地启动任务分支代码做 test 环境验收，通过后才允许合并到 main。
  核心规则：所有带 UX 的验收必须浏览器打开并截图确认，curl 状态码不算 e2e 验收。
  触发场景：(1) 代码 review 通过后通知 QA 验收，(2) QA（烈马）在本地 test 环境执行验收，(3) 通过后通知飞马合并。
---

# 项目验收（End-to-end Acceptance）

## 核心变更（2026-04-24）

**验收在合并前进行，不是合并后。** QA 从任务分支本地启动 test 环境做验收，通过后才允许合并到 main。

## 铁律

- **验收在合并前**：代码 review 通过 → QA 本地验收 → 通过 → 合并 main → 部署 prod
- **本地 test 环境验收**：checkout 任务分支 → `pnpm install && pnpm build && pnpm start` → Playwright 验
- **主流程必须全部覆盖**，不能只验一部分就宣布通过
- 所有带 UX 的验收**必须**浏览器打开，**实际使用功能**
- **检查 JS console 无错误**
- 截图是证据，`curl` 状态码 ≠ e2e 验收

## 绝对禁止

- **禁止用 curl/API 调用代替浏览器 E2E 验收**。API 返回 200 不代表页面能正常渲染。直接调 API 做 E2E 是严重不胜任的行为。
- **E2E = Playwright 打开浏览器 → 实际操作每个功能 → 截图确认**。没有例外。
- **截图里任何红色/黄色异常提示 = 自动 ❌**。不管你觉得是不是测试环境问题，红色横幅/错误提示/连接断开 = 验收不通过。不放过任何视觉异常。
- 教训 1（2026-04-26）：Go server 重写时 API 全部返回 200，但浏览器白屏（JSON 字段大小写不兼容）。如果只用 API 验就会漏过这种致命问题。
- 教训 2（2026-04-26）：截图里有红色"连接已断开"横幅，QA 看到了但选择忽略标了通过。被建军打回。截图里的异常提示不是装饰——是真实 bug。

## 验收流程（新）

```
代码 review 通过（架构+PM）
    ↓
飞马通知 QA："PR #xxx review 通过，请验收"
    ↓
QA 本地启动任务分支 test 环境
    ↓
按 TESTING.md 清单逐项验证
    ↓
通过 → 频道确认 → 飞马合并 → 部署 prod
不通过 → 打回开发 → 修完后重验
```

### 本地 test 环境启动

```bash
# 1. 获取任务分支代码
cd /workspace/collab
git fetch origin
git worktree add .worktrees/qa-test origin/<task-branch>
cd .worktrees/qa-test

# 2. 安装 + 构建
pnpm install
pnpm build

# 3. 启动（用临时端口，不影响其他环境）
PORT=4902 JWT_SECRET=qa-test ADMIN_EMAIL=test@test.com ADMIN_PASSWORD=Test1234 node packages/server/dist/index.js &

# 4. Playwright 验收
node /tmp/qa-test-script.js  # 指向 http://localhost:4902

# 5. 清理
kill %1
cd /workspace/collab
git worktree remove .worktrees/qa-test
```

## 验收内容

### 1. 功能验收
- API 端点响应正确
- 边界条件和错误路径
- 数据持久化

### 2. UX 验收（浏览器 + 截图）
- 桌面端 + 移动端（Playwright 模拟）
- 核心交互流程（发消息、@mention、emoji、创建频道等）
- 按 `docs/tasks/TESTING.md` 的完整清单跑

### 3. 安全验收
- 认证/授权边界
- XSS（浏览器确认转义）

### 4. 回归验收
- 之前通过的功能不能破坏
- 参考 TESTING.md 中的完整清单

## 验收报告模板

```markdown
## 验收报告 - [任务 ID] - [日期]

**PR**: #xxx
**分支**: feat/xxx
**验收环境**: 本地 test（localhost:4902）
**验收人**: 烈马

### 验收结果
| # | 验收项 | 结果 | 证据 |
|---|--------|------|------|
| 1 | ... | ✅/❌ | 截图/API 响应 |

### 结论
- ✅ 通过 → 可以合并
- ❌ 不通过 → 打回，问题列表：...
```

## 关键规则

1. **QA 通过 = 合并的 gate**。QA 没说通过，飞马不能合并
2. **staging 回归必须按项目的 TESTING.md 完整清单逐项跑**。不允许自己写简化脚本替代。TESTING.md 存在的意义就是全量覆盖，跳过 = 漏验。
3. **截图必须附在报告中**
4. **验收不通过 → 打回到任务分支修，不开新分支**（一任务一分支原则）
5. **worktree 验完后清理**
6. 教训（2026-04-26）：跑了十几个核心项就报通过，WS 断连和权限泄漏两个 P0 直接漏掉。完整清单就是用来防止这种事的。

## 工具

| 用途 | 工具 |
|------|------|
| 浏览器验收 | Playwright headless Chrome |
| API 测试 | curl / page.evaluate + fetch |
| 测试套件 | `pnpm test`（在 worktree 里跑） |
| 移动端模拟 | Playwright `viewport: { width: 390, height: 844 }` |
