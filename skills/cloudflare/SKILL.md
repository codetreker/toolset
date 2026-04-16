---
name: cloudflare
description: >
  操作 Cloudflare 资源（DNS、Workers、Pages、D1、KV、Access 等）。
  覆盖：wrangler CLI 用法、cf-token 工具、DNS 管理红线、部署流程。
  适用于：(1) 部署 Worker/Pages，(2) 管理 DNS 记录，(3) 配置 Access 策略，(4) 管理 API Token，(5) 查看/操作 D1 数据库。
---

# Cloudflare 操作手册

---

## 账号信息

- **账号邮箱**：`oc-pegasus@codetrek.work`（实际 OAuth 关联 `jianjun@codetrek.work`）
- **域名**：`codetrek.work`
- **Account ID**：`7d7db4dda3319d23e2cedcf70ea2aa45`

## 认证方式

| 方式 | 用途 | 位置 |
|------|------|------|
| Wrangler OAuth | Workers/Pages/D1/KV 操作 | 已登录，直接用 `wrangler` |
| Master Token | 完整 API 权限，用于 `cf-token` 创建子 token | `~/.config/cloudflare/master-token` |
| DNS Token | codetrek.work DNS 管理专用 | `~/.config/cloudflare/dns-token` |

## 工具

### wrangler（主力工具）

```bash
# Workers
wrangler deploy                    # 部署当前目录的 Worker
wrangler dev                       # 本地开发
wrangler tail <worker-name>        # 实时日志

# D1
wrangler d1 list                   # 列出数据库
wrangler d1 execute <db> --command "SQL"  # 执行 SQL

# KV
wrangler kv namespace list
wrangler kv key list --namespace-id <id>

# Pages
wrangler pages project list
wrangler pages deploy <dir> --project-name <name>

# DNS（wrangler 不直接管 DNS，用 API）
```

### cf-token（Token 管理工具）

位置：`~/.local/bin/cf-token`

⚠️ 依赖 `jq`，容器里可能没装。需要时先 `apt-get install -y jq`。

```bash
cf-token list                                          # 列出所有 token
cf-token create <name> --permissions zone.dns:edit --zone codetrek.work  # 创建 token
cf-token verify <token>                                # 验证 token
cf-token delete <token-id>                             # 删除 token
```

### DNS 直接用 curl + API

```bash
# 列出 DNS 记录
curl -s -H "Authorization: Bearer $(cat ~/.config/cloudflare/dns-token)" \
  "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/dns_records" | python3 -m json.tool

# 创建记录
curl -s -X POST -H "Authorization: Bearer $(cat ~/.config/cloudflare/dns-token)" \
  -H "Content-Type: application/json" \
  -d '{"type":"A","name":"sub.codetrek.work","content":"1.2.3.4","proxied":true}' \
  "https://api.cloudflare.com/client/v4/zones/<ZONE_ID>/dns_records"
```

---

## ⛔ 红线（绝对不能碰）

1. **不要修改 MX 记录** — 邮件会断
2. **不要修改 TXT 记录**（SPF/DKIM/DMARC）— 邮件认证会断
3. **不要删除正在使用的 DNS 记录** — 先确认没有服务依赖
4. **不要修改 SSL/TLS 模式** — 除非建军明确要求
5. **不要删除 Worker/Pages 项目** — 只能新建或更新

## ⚠️ 操作原则

- **DNS 变更前先列出现有记录**，确认不会冲突
- **部署前先在 `wrangler dev` 本地验证**
- **新建子域名可以自主判断**，但删除/修改已有记录要谨慎
- **Access 策略变更要告知建军**，因为影响谁能访问什么
- **操作完检查结果** — `curl` 验证 DNS 生效，`wrangler tail` 看 Worker 日志

## 现有资源

### D1 数据库
| 名称 | 用途 |
|------|------|
| copilot-db-staging | Copilot Gateway staging |
| baton-store-dev | 开发用 |

### DNS 关键记录（不要动）
- MX 记录 — 邮件
- TXT 记录 — SPF/DKIM/DMARC
- copilot.codetrek.work — Copilot Gateway 生产

---

## 常见操作流程

### 部署新 Worker

1. 在项目目录确认 `wrangler.toml` 配置正确
2. `wrangler dev` 本地测试
3. `wrangler deploy` 部署
4. `wrangler tail <name>` 确认运行正常
5. 如需自定义域名，添加 DNS CNAME 记录

### 添加新子域名

1. 确认没有同名记录：列出现有 DNS
2. 添加 A/CNAME 记录
3. 验证解析：`dig sub.codetrek.work` 或 `curl -I https://sub.codetrek.work`

### 配置 Cloudflare Access

1. 确认保护对象（域名/路径）
2. 通过 Cloudflare Dashboard 或 API 创建 Access Application
3. 设置认证方式（通常是 OTP 邮箱）
4. 告知建军配置了什么、谁能访问
