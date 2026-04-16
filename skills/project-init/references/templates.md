# 模板参考

---

## BOARD.md

位置：`{项目仓库}/docs/tasks/BOARD.md`

```markdown
# {项目名} Task Board

> **Owner** = 此刻球在谁手上，随状态流转变化。所有任务必须有 Owner，无主任务不允许存在。
> 对应关系：Backlog/Ready/讨论中→Team Lead，In Progress→Dev，In Review→Team Lead，验收→QA，Done→Team Lead。

| ID | 任务 | 状态 | Owner | PR |
|----|------|------|-------|----|
```

---

## 频道注册表条目

位置：`oc-shared/TEAM-DIRECTORY.md`

```markdown
## 项目频道

| 频道 | 频道 ID | 项目 | 代码目录 | 代码仓库 | 任务板 | 状态 |
|------|---------|------|---------|---------|--------|------|
| #project-xxx | 123456 | Xxx | `/workspace/xxx` | org/xxx | `docs/tasks/BOARD.md` | active |
```

| 字段 | 说明 |
|------|------|
| 频道 | 频道名（带 #） |
| 频道 ID | 频道数字 ID |
| 项目 | 项目名称 |
| 代码目录 | 本地路径 |
| 代码仓库 | GitHub 仓库（`org/repo` 格式） |
| 任务板 | GitHub Project（`org/projects/N`）或 `docs/tasks/BOARD.md` |
| 状态 | `active` / `archived` |

---

## TRACKER.md 条目

```markdown
### {项目名称}
- **频道**：#{频道名}（`频道ID`）
- **代码目录**：`/workspace/{项目名}`
- **仓库**：`https://github.com/{org}/{repo}`
- **任务板**：GitHub Project / BOARD.md
- **当前焦点**：{一句话描述}
```
