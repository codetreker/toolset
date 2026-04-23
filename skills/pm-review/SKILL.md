---
name: pm-review
description: PM 视角的 PR Review。用于：开发提交 PR 后，PM 从需求一致性角度 review（不看代码质量，那是架构师的事）。触发场景：(1) PR 提交后需要 PM review，(2) 飞马通知 PM review PR，(3) feature-lifecycle 流程中的 PM review 环节。
---

# PM Review

PM review 不看代码质量——看的是**需求有没有被正确实现**。

## Review 检查清单

### 1. 对照 PRD
- 读 `docs/tasks/<TASK-ID>/prd.md`
- 逐条检查验收标准是否被覆盖
- 标记：✅ 覆盖 / ❌ 遗漏 / ⚠️ 偏离

### 2. 用户体验
- 前端改动：看截图或 staging 实际操作
- 交互流程是否符合 PRD 描述的用户故事
- 边界场景：空状态、错误提示、权限不足

### 3. 范围检查
- 是否做了 PRD "不在范围" 里的东西（scope creep）
- 是否漏了 PRD 里的需求

### 4. 输出
在 PR 上留 review comment，格式：

```
## PM Review

### 需求覆盖
- [x] 需求 1: xxx — ✅
- [ ] 需求 2: xxx — ❌ 缺少 xxx
- [x] 需求 3: xxx — ⚠️ 实现方式偏离，建议 xxx

### UX 检查
- （截图/观察结果）

### 结论
- ✅ Approve / ❌ Request Changes
```

## 禁止
- ❌ 评论代码风格/架构（那是飞马的事）
- ❌ 没读 PRD 就 review
- ❌ 没看 staging/截图就 approve 有 UI 的 PR
