---
name: devops-taskflow
description: >-
  DevOps 操作标准流程：部署、CI/CD、基础设施（Docker、DNS、反代、registry 等）。
  核心规则：规划 → 讨论 → 确认 → 执行，不跳步。
  触发场景：部署到 staging/prod、配置 CI/CD pipeline、操作远程服务器、
  Docker 镜像管理、DNS/反代/TLS 配置、registry 搭建等。
  不适用于：写代码（用 dev-taskflow）、写设计文档（用 tech-designflow）。
---

# DevOps TaskFlow — 规划 → 讨论 → 确认 → 执行

## 核心流程（不可跳步）

```
需求/问题 → [1] 规划方案 → [2] 讨论确认 → [3] 执行 → [4] 验证
              (列清单)     (频道讨论)    (subagent)  (health check)
```

### Step 1: 规划方案

收到 DevOps 任务后，**先列方案再讨论，不动手**：

- **要做什么**：具体操作步骤
- **怎么做**：技术方案、工具选择
- **影响什么**：哪些服务受影响、停机时间、磁盘/内存/带宽消耗
- **回滚方案**：出问题怎么恢复
- **限制条件**：磁盘空间、内存、网络、费用

**禁止**：收到问题就去改代码/配置。建军提问题是想讨论，不是让你执行。

### Step 2: 讨论确认

把方案发到频道，等建军确认：

- 方案要简洁：要做 A、B、C，影响 X、Y，回滚方案是 Z
- 建军可能有不同想法或追加需求
- **讨论没结束不写代码、不改配置、不操作服务器**
- 建军说"做"或"确认"才进 Step 3

### Step 3: 执行

**耗时操作必须用 subagent**，主 session 保持频道响应：

- Docker build/push/pull → subagent
- SCP 大文件 → subagent
- SSH 远程操作 → subagent
- 任何预计 > 30 秒的操作 → subagent

**禁止在飞马容器本地 build Docker image**——磁盘有限，会撑满。

### Step 4: 验证

- Health check（curl）
- 浏览器打开确认（有 UI 的服务）
- 日志检查（docker logs）
- 资源检查（磁盘、内存）

## 硬规则

1. **规划 → 讨论 → 确认 → 执行**，不跳步
2. **建军提问 ≠ 让你执行**——先理解他想讨论什么
3. **不在飞马容器本地 build Docker image**
4. **耗时操作走 subagent**，主 session 不阻塞
5. **每个操作要有回滚方案**
6. **操作远程服务器前方案必须确认**
7. **部署后必须验证**（curl 200 不算，浏览器确认才算）

## 经验教训（2026-04-21）

- 边讨论边改代码 → 改了 12 个 PR 还没搞定 CI/CD
- 本地 build Docker image → 磁盘撑满，建军手动清
- Harbor 白装白拆 → 1.7GB 浪费
- 主 session 跑 docker build → 消息排队，频道无响应
- GitHub Actions artifact 限制没搞清就做 → 方案不可行
- 阿里云内存不足 build 失败 → 没提前检查就执行
