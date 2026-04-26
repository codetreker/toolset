---
name: using-subagent
description: "How to spawn subagents properly. Use when about to call sessions_spawn with runtime=subagent. Covers timeout, patience, and result handling. Trigger: about to spawn subagent, need to set timeout, subagent task delegation."
---

# Using Subagent

## Call pattern

```json
{
  "runtime": "subagent",
  "task": "具体任务描述",
  "runTimeoutSeconds": 3600
}
```

## Timeout

**统一 1 小时起步。** subagent 需要时间读文件、思考、执行。不要猜复杂度。

```
runTimeoutSeconds = 3600
```

复杂任务（大量代码调研、多步骤操作）给 2 小时：

```
runTimeoutSeconds = 7200
```

**A killed run is a wasted run.**

## 耐心

- **不要因为"太慢"就 kill**——subagent 可能正在读大量文件或思考复杂问题
- **不要 poll 等结果**——系统完成后自动回调
- spawn 后**立即回复用户**（"已派出去了"），然后做别的事
- 回调来了再转述结果

## Task description

Be specific and actionable:

```
❌ "看看这个项目"
✅ "读 /workspace/borgee/src/，分析 WebSocket 推送架构。输出：1) 消息流转路径 2) 关键文件 3) 瓶颈"
```

## Notes

- subagent 里没有 `sessions_spawn`，不能嵌套 spawn
- subagent 里 `exec background=true` 的回调会丢失——用同步 exec
- subagent 继承 workspace 目录，可以读写文件
