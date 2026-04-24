---
name: using-codex
description: "How to call Codex for any task: coding, refactoring, code review, research, root cause analysis, or investigation. Covers exec parameters, timeout selection by task type, result handling, and cwd setup. Trigger: about to call Codex, need to set timeout, need to spawn Codex session."
---

# Using Codex

## 判断你在哪

- **Interactive session**（与人对话）→ exec background，异步
- **Subagent**（被 spawn 出来干活）→ 同步 exec

## Interactive session 路径

```bash
exec background=true workdir="/workspace/project-dir" timeout=1800 command="codex --yolo exec 'task description'"
```

- `--yolo` — 跳过沙箱和审批（容器环境 bwrap 不可用）
- `background=true` — 异步，不阻塞当前 session
- spawn 后**立即回复用户**，不要等结果
- 系统完成后自动回调，**不要 poll**

## Subagent 路径

subagent 里 background exec 的回调会丢失，用同步 exec：

```bash
exec workdir="/workspace/project-dir" timeout=1800 command="codex --yolo exec 'task description'"
```

- **不加 `background=true`**——subagent 结束后回调会丢失
- 用同步 exec 等 Codex 完成后再返回结果
- timeout 给够（见下表）

## Timeout

**最少 15 分钟起步。** 很多时候没法预估复杂度，给少了等于白跑。

| Task type | Timeout |
|-----------|---------|
| 一般任务（默认） | 15 min (900s) |
| 复杂编码 / 调研 / 分析 | 30 min (1800s) |

**A killed run is a wasted run. When in doubt, 30 min.**

## Task description

Be specific and actionable:

```
❌ "看看这个项目"
✅ "读 /workspace/collab/src/，分析 WebSocket 推送架构。输出：1) 消息流转路径 2) 关键文件 3) 瓶颈"
```

## Notes

- Use `workdir` to point at the actual project directory
- Do NOT run Codex inside `~/.openclaw`
- Multiple exec can run in parallel
- Codex ACP 在容器环境有 bwrap 沙箱问题，暂用 exec 代替
