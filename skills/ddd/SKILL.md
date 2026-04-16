---
name: ddd
description: >
  Document-Driven Development (DDD) 流程。核心规则：没有审批过的设计文档，不许写代码。
  覆盖：设计文档流程（讨论→设计→Review→审批→实现）、Task Breakdown 规范、Milestone Checkpoint Review。
  适用于：(1) 新功能/新模块开发前的设计文档编写与审批，(2) 任务拆分与估算，(3) 开发过程中的 checkpoint review 与验收，(4) 判断是否需要设计文档。
  所有角色通用——总管/架构用它审批设计，开发用它理解流程，QA 用它了解验收标准。
---

# Document-Driven Development (DDD)

**核心规则：没有审批过的设计文档，不许写代码。**

---

## 什么时候需要设计文档

| 场景 | 需要设计文档？ |
|------|--------------|
| 新功能 / 新模块 | ✅ 必须 |
| 重大重构 | ✅ 必须 |
| Bug 修复 | ❌ 除非涉及架构变更 |
| 配置 / 基础设施调整 | ❌ |
| 一行改动 | ❌ |

---

## DDD 流程

```
想法 → 讨论 → 设计文档 → Review → 审批 → 任务拆分 → 实现
```

1. **讨论**：在项目频道讨论需求和方案
   - **一次问一个问题**——不要一次丢 10 个问题，问最重要的，等回答，再问下一个
   - **提 2-3 个方案带推荐**——不要只问"你想怎么做？"，给选项和你的建议
   - **挑战 scope creep**——"这个 v1 需要吗？能不能后面再加？"
   - **分段验证**——设计文档分块确认，不要写完 5 页才问"看起来行吗？"
   - 架构提出技术选型和 trade-off
2. **设计文档**：架构输出设计文档，存入项目仓库的 `docs/` 目录
   - 模板见 `references/design-template.md`
   - 覆盖：目标、架构、组件、数据流、错误处理、测试策略
   - 附带 Task Breakdown（见下节）
3. **Review Gate**：全员 review 设计文档（不是只看聊天记录）
   - 有修改意见 → 修改后重新 review
   - 明确审批后才进入开发
4. **实现**：开发按审批后的设计文档工作，偏离设计必须讨论

### 反模式

- ❌ 老板说"做 X"就直接开始写代码
- ❌ 设计只存在于聊天记录里
- ❌ 总管独自写设计文档不找架构
- ❌ 设计文档审批了但开发不看
- ❌ "这个太简单不需要设计文档"——简单功能也写个短 spec

---

## Task Breakdown 规范

每个设计文档必须附带任务拆分。**不接受笼统的"实现功能 X"。**

### 规则

1. **每个子任务必须单 session 可完成**——如果估不了就拆更细
2. **附大小估算**：S（<200 LOC）/ M（200-500 LOC）/ L（>500 LOC）
3. **每个子任务 = 一个 commit/PR**，不搞 big bang
4. **明确输入输出**：改哪些文件、新建哪些文件、交付什么

### 好的拆分示例

```
M5 — 多语言索引

M5.1: Tokenizer 接口抽象（S）
  - 新建: tokenizer/interface.go
  - 修改: tokenizer/tokenizer.go
  - 测试: tokenizer/interface_test.go
  - commit 后 review 再继续

M5.2: CJK Tokenizer 实现（M）
  - 新建: tokenizer/cjk.go
  - 测试: tokenizer/cjk_test.go
  - commit 后 review 再继续

M5.3: 搜索适配（S）
  - 修改: searcher/searcher.go
  - 测试: searcher/cjk_search_test.go
  - commit 后 review 再继续

M5.4: Benchmark + 集成测试（S）
  - 新建: tokenizer/benchmark_test.go
  - 全部测试通过后提 PR
```

### 坏的拆分

```
M5 — 实现多语言索引，包含 tokenizer 抽象、CJK 支持、
     搜索适配和 benchmark。
```

---

## Milestone Checkpoint Review

### 规则

1. **每个子任务是一个 checkpoint**——开发 commit 后，总管 review diff 再继续
2. **Checkpoint review 是轻量级的**：代码是否符合设计？测试是否通过？有没有偏离？
3. **发现问题立刻停**——在下一个子任务之前纠正，修小的便宜，最后修大的贵
4. **实时更新状态**——每次状态变更都反映到 Project Board 或 BOARD.md

### 完整验收 Checklist

每个 milestone 完成时必须检查：

- [ ] 设计文档状态已更新
- [ ] 所有测试通过（单测 + 集成 + e2e）
- [ ] 代码 review 通过（总管签字）
- [ ] QA 验收通过
- [ ] 文档和代码同步发布——不接受"文档后补"
- [ ] e2e 验证（编译 → 起服务 → 实际使用），不能只跑单测
