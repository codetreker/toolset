---
name: using-codex
description: "How to call Codex via ACP runtime. Use when spawning Codex for any task: coding, refactoring, code review, research, root cause analysis, or investigation. Covers sessions_spawn parameters, timeout selection by task type, result handling, and cwd setup. Trigger: about to call Codex, need to set timeout, need to spawn Codex ACP session."
---

# Using Codex

## 判断你在哪

- **Interactive session**（与人对话）→ 用 ACP，异步
- **Subagent**（被 spawn 出来干活）→ 用同步 exec

## Interactive session 路径

```json
{
  "runtime": "acp",
  "agentId": "codex",
  "mode": "run",
  "task": "具体任务描述",
  "cwd": "/workspace/project-dir",
  "runTimeoutSeconds": 900
}
```

- `mode: "run"` — one-shot，执行完结果推回。**默认用这个。**
- `mode: "session"` — 持久会话，绑定 Discord thread。**必须搭配 `thread: true`**。
- spawn 后**立即回复用户**，不要等结果
- 系统完成后自动回调，**不要 poll**

## Subagent 路径

subagent 里没有 `sessions_spawn`，用同步 exec：

```bash
exec workdir="/workspace/project-dir" timeout=1800 command="codex --yolo exec 'task description'"
```

- `--yolo` — 跳过沙箱，非交互模式，不需要 PTY
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

- Use `cwd` (ACP) or `workdir` (exec) to point at the actual project directory
- Do NOT run Codex inside `~/.openclaw`
- Multiple spawns can run in parallel
- Codex creates its own workspace at `~/.openclaw/workspace/codex/` — this is normal
