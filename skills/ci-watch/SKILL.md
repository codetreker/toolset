---
name: ci-watch
description: PR CI 监控与自动合入。当 PR 已 approve + review 通过但 CI 还在跑时，起一个 background watch 自动监控 CI 状态，全绿自动 squash merge，失败通知频道。触发场景：(1) PR approve 后等 CI，(2) CI 正在跑需要等结果，(3) 说"等 CI"或"CI 跑完再 merge"时。NOT for: 未经 review/approve 的 PR。
---

# CI Watch

PR approve + review 通过后，不要口头说"等 CI"然后忘掉。用 background watch 自动监控。

## 触发时机

- PR 已 approve + review 通过
- CI 正在跑（pending/queued）
- 说"等 CI 跑完"时 → 立刻起 watch，不要等 heartbeat

## 使用方式

用 `exec` background 模式跑监控循环。所有参数由调用者（飞马）根据上下文填入。

### 参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| PR 号 | 必填 | PR number |
| 仓库 | 必填 | owner/repo 格式 |
| 检查间隔 | 30s | 轮询间隔 |
| 超时 | 10min | 超过后放弃并通知 |
| 通知频道 | 当前频道 | merge 成功/失败通知目标 |

### 监控脚本模板

```bash
REPO="owner/repo"
PR=123
INTERVAL=30
TIMEOUT=600
ELAPSED=0

while true; do
  # 获取 check 状态（--json 拿结构化数据）
  CHECKS=$(gh pr checks "$PR" -R "$REPO" 2>&1)
  EXIT_CODE=$?

  # 判断是否全部通过
  if echo "$CHECKS" | grep -q "fail\|failure"; then
    # CI 失败 — 提取失败的 job
    FAILED=$(echo "$CHECKS" | grep -E "fail|failure")
    echo "CI_FAILED|$FAILED"
    exit 1
  elif echo "$CHECKS" | grep -qE "pending|queued|in_progress|waiting"; then
    # 还在跑 — 继续等
    sleep "$INTERVAL"
    ELAPSED=$((ELAPSED + INTERVAL))
    if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
      echo "CI_TIMEOUT|elapsed=${ELAPSED}s"
      exit 2
    fi
  else
    # 全绿 — 尝试 merge
    MERGE_OUTPUT=$(gh pr merge "$PR" -R "$REPO" --squash --auto 2>&1)
    if [ $? -eq 0 ]; then
      echo "CI_PASSED_MERGED|$PR"
      exit 0
    else
      # --auto 失败，尝试直接 merge
      MERGE_OUTPUT=$(gh pr merge "$PR" -R "$REPO" --squash 2>&1)
      if [ $? -eq 0 ]; then
        echo "CI_PASSED_MERGED|$PR"
        exit 0
      else
        echo "MERGE_FAILED|$MERGE_OUTPUT"
        exit 3
      fi
    fi
  fi
done
```

### 调用示例

```
exec background:true command:"bash -c '
REPO=\"codetreker/haystack\" PR=52 INTERVAL=30 TIMEOUT=600 ELAPSED=0
while true; do
  CHECKS=$(gh pr checks $PR -R $REPO 2>&1)
  if echo \"$CHECKS\" | grep -q \"fail\\|failure\"; then
    FAILED=$(echo \"$CHECKS\" | grep -E \"fail|failure\")
    echo \"CI_FAILED|$FAILED\"; exit 1
  elif echo \"$CHECKS\" | grep -qE \"pending|queued|in_progress|waiting\"; then
    sleep $INTERVAL; ELAPSED=$((ELAPSED + INTERVAL))
    [ $ELAPSED -ge $TIMEOUT ] && echo \"CI_TIMEOUT|elapsed=${ELAPSED}s\" && exit 2
  else
    gh pr merge $PR -R $REPO --squash 2>&1 && echo \"CI_PASSED_MERGED|$PR\" && exit 0
    echo \"MERGE_FAILED\"; exit 3
  fi
done
'"
```

### 结果处理

监控结束后，根据 exit code 用 `message` 工具通知频道：

| Exit Code | 状态 | 通知内容 |
|-----------|------|----------|
| 0 | ✅ 全绿已合入 | "PR #N CI 全绿，已 squash merge ✅" |
| 1 | ❌ CI 失败 | "PR #N CI 失败 ❌：{具体失败的 job}" |
| 2 | ⏰ 超时 | "PR #N CI 超时（{N}分钟），需要人工检查" |
| 3 | ⚠️ Merge 失败 | "PR #N CI 通过但 merge 失败：{原因}" |

### 安全红线

- **只在 PR 已 approve + review 通过时使用**
- 不要在没 review 通过的 PR 上自动 merge
- merge 前不需要再次确认（已经 approve 了就是确认）
- 如果 merge 失败，通知人类处理，不要重试
