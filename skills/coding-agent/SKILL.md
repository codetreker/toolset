---
name: coding-agent
description: "How to call coding agents (Claude Code, Codex) via exec. Use when spawning a coding agent for any task: coding, refactoring, code review, research, root cause analysis, investigation, or PR review. Covers exec parameters per agent, interactive vs subagent paths, timeout, result handling, progress updates, and workdir setup. Trigger: about to call Claude Code or Codex, need to set timeout, need to run coding agent."
---

# Coding Agent

统一的 coding agent 调用规范。覆盖 Claude Code 和 Codex。

## 选 agent

| Agent | 命令 | 特点 |
|-------|------|------|
| **Claude Code** | `claude --permission-mode bypassPermissions --print` | 启动快（~7s），不需要 PTY |
| **Codex** | `codex --yolo exec` | 跳过沙箱，不需要 PTY |

没有特殊偏好时默认用 Claude Code。用户指定了就用指定的。

## 判断你在哪

- **Interactive session**（与人对话）→ `exec background=true`，异步
- **Subagent**（被 spawn 出来干活）→ 同步 exec，不加 background

**跑 coding agent 不需要套 subagent。** exec background 本身就是异步的。

## Interactive session 路径

Claude Code:
```bash
exec background=true workdir="/workspace/project-dir" timeout=7200 command="claude --permission-mode bypassPermissions --print 'task description'"
```

Codex:
```bash
exec background=true workdir="/workspace/project-dir" timeout=7200 command="codex --yolo exec 'task description'"
```

- `background=true` — 异步，不阻塞当前 session
- spawn 后**立即回复用户**（"已派 Claude Code / Codex"）
- 系统完成后自动回调，**不要 poll**

## Subagent 路径

subagent 里 `background=true` 的回调会丢失，用同步 exec：

Claude Code:
```bash
exec workdir="/workspace/project-dir" timeout=7200 command="claude --permission-mode bypassPermissions --print 'task description'"
```

Codex:
```bash
exec workdir="/workspace/project-dir" timeout=7200 command="codex --yolo exec 'task description'"
```

- **不加 `background=true`**——subagent 结束后回调丢失
- 用同步 exec 等完成后再返回结果

## Timeout

**统一 2 小时（7200s）。** 不要猜复杂度，给够时间就对了。

**A killed run is a wasted run.**

## Progress Updates

spawn coding agent 后，保持用户知情：

- **启动时**：发 1 条简短消息（跑什么、在哪个目录）
- **过程中只在有变化时更新**：
  - milestone 完成（build 通过、测试通过）
  - agent 需要输入 / 遇到问题
  - 出错需要用户决策
- **完成时**：汇报结果（改了什么、在哪里）
- **如果 kill 了**：立即说明 kill 了以及原因

**不要**每隔几分钟发"还在跑"——没有信息量的更新是噪音。

## Task description

具体可执行，不要模糊：

```
❌ "看看这个项目"
✅ "读 /workspace/borgee/src/，分析 WebSocket 推送架构。输出：1) 消息流转路径 2) 关键文件 3) 瓶颈"
```

## Notes

- Use `workdir` to point at the actual project directory
- Do NOT run inside `~/.openclaw`
- Multiple exec can run in parallel
- 不要在 coding agent prompt 里让它自己 commit / push，除非任务明确要求
