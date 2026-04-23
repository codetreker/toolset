---
name: code-review
description: Code Review 标准流程。用 coding agent（Claude Code / Codex）做 PR review 时，自动带上标准 checklist + PR 特定检查项。适用于：(1) 飞马给 coding agent 派 review 任务时，(2) review 设计文档对应的实现时，(3) PR review 流程，(4) 需要对照 spec 检查代码实现时。触发词：code review、PR review、review PR、review 代码、review 实现。
---

# Code Review

标准 Code Review 流程。通过 coding agent 执行 review，自动带上 checklist，确保覆盖全面。
调用方式见 `using-claude-code` / `using-codex` skill。

## 标准 Review Checklist

每次 review 必须覆盖以下 7 项：

1. **符合设计** — 代码是否按设计文档实现？有没有偏离 spec？
2. **测试覆盖** — 正常路径、边界条件、错误路径都测了吗？
   - **`// nocov` 红线**：只允许用在运行时不可达的防御性错误处理上（如 Pebble Batch.Set 永远不返回 error）。**绝对不允许**用来跳过应该测试但没测试的代码。发现滥用 nocov 必须打回修改。
3. **错误处理** — 有没有静默失败？错误信息对调试有帮助吗？
4. **代码质量** — 可读性、命名、函数大小、重复代码、dead code
5. **性能** — 有明显性能问题吗？热路径合理吗？有不必要的分配吗？
6. **安全** — 硬编码密钥？输入校验？注入风险？权限检查？**API Key / Token 禁止通过 query string 传递，必须用 HTTP header（`Authorization: Bearer` 或 `X-API-Key`）**——query string 会被日志、CDN、浏览器历史记录。**Cookie 必须设置 `HttpOnly`（防 XSS 窃取）+ `Secure`（仅 HTTPS）+ `SameSite=Strict/Lax`**。
7. **文档** — 行为变了文档跟着改了吗？公共 API 有注释吗？

## 算法代码特殊要求

涉及算法实现（搜索、索引、加密、ML、数值计算等）时，额外检查：

- 对照原始论文/规范逐步检查实现正确性
- 数值计算检查精度损失和溢出
- 并发代码检查竞态条件和死锁
- 不能只看代码"看起来合理"——逐步验证每个步骤

## Spec 对照（有设计文档时）

当 PR 有对应的设计文档时：

1. 读取设计文档（通常在 `docs/design/` 目录）
2. 逐条检查 spec 约束是否在代码中实现
3. 输出对照表：

```
| Spec 要求 | 实现状态 | 备注 |
|-----------|---------|------|
| 约束 A    | ✅ 已实现 | file.go:42 |
| 约束 B    | ❌ 未实现 | 缺少边界检查 |
| 约束 C    | ⚠️ 部分  | 只覆盖了主路径 |
```

## PR 特定检查项

在 prompt 中添加 `EXTRA_CHECKS` 部分，根据 PR 内容指定额外检查项。

示例：
- mmap 相关：page alignment、munmap 配对、零 CGo
- 网络相关：超时设置、连接泄漏、重试逻辑
- 数据库相关：事务边界、索引使用、N+1 查询
- 并发相关：锁粒度、channel 关闭、goroutine 泄漏

## 输出格式

Review 结果按严重程度分级：

- **P0 (Critical)** — 正确性问题、数据丢失风险、安全漏洞
- **P1 (Must Fix)** — 性能问题、错误处理缺失、设计偏离。**P1 也必须修复才能合入。**
- **P2 (Nice to Have)** — 代码风格、命名建议、文档改进

每个问题格式：

```
### [P0] 问题标题
- **文件**: path/to/file.go:42
- **问题**: 具体描述
- **建议**: 修复方案
```

最终结论二选一：
- **APPROVE** — 无 P0/P1 问题
- **REQUEST CHANGES** — 列出所有 must-fix 项

## 执行方式

用 coding agent（Claude Code 或 Codex）执行 review。调用参数和超时见 `using-claude-code` / `using-codex` skill。

### Prompt 模板

复制以下模板，填入 `{变量}` 部分：

```
你是一个严格的 Code Reviewer。按以下流程 review PR。

## 任务
Review PR #{pr_number} on branch {branch_name} in repo {repo_path}.

## 获取 diff
运行: gh pr diff {pr_number} --repo {repo}
读取相关源文件以理解上下文。

## 标准 Checklist（逐项检查）
1. 符合设计 — 代码是否按设计文档实现？有没有偏离？
   {如有设计文档: "设计文档路径: docs/design/xxx.md，逐条对照检查"}
2. 测试覆盖 — 正常路径、边界、错误路径都测了吗？
3. 错误处理 — 有没有静默失败？错误信息有意义吗？
4. 代码质量 — 可读性、命名、函数大小、重复代码
5. 性能 — 有没有明显的性能问题？热路径合理吗？
6. 安全 — 有没有硬编码密钥？输入有没有校验？
7. 文档 — 行为变了文档跟着改了吗？

## 额外检查项
{extra_checks，如无则删除此节}

## 输出格式
按 P0/P1/P2 分级列出所有问题。
每个问题包含：文件路径、行号、问题描述、建议修复。
{如有设计文档: "输出 Spec 对照表"}
最终给出结论：APPROVE 或 REQUEST CHANGES（列出 must-fix）。

将 review 结果写到 {output_path} 文件。
```

### Review 态度

- 通过 → 明确说 "LGTM" 或 "通过"
- 不通过 → **具体指出问题**（哪个文件、哪一行、什么问题、建议怎么改）
- 不要只说"有点问题"——要给开发足够信息去修

### 使用流程

1. 确定 PR 号和仓库路径
2. 判断是否有对应设计文档，有则加入 prompt
3. 根据 PR 内容添加额外检查项（`extra_checks`）
4. 用模板组装 prompt
5. 用 coding agent 跑 review（调用方式见 `using-claude-code` / `using-codex` skill）
6. 读取输出，在频道发布 review 结论
