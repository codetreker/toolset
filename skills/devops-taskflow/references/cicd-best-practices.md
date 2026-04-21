# DevOps Best Practices — CI/CD Pipeline

## Harbor + GitHub Actions 部署方案（Collab 项目实践 2026-04-21）

### 架构
```
GitHub Actions (CI runner)
  └── build image → push harbor.codetrek.cn/library/<app>:<timestamp> + :staging
                                          ↓
Harbor (阿里云本机)                    镜像存储
                                          ↓
阿里云 Docker                         docker compose pull → up -d
```

### 镜像 Tag 策略
- **Build tag**: `YYYYMMDD-HHMMSS`（人类可读，可追溯）
- **Staging tag**: `:staging`（滚动更新）
- **Prod tag**: `:prod`（通过 Harbor API 打 tag，不拉镜像）
- Git tag: `v<同一个 timestamp>`

### 关键决策

1. **用 Harbor 私有 registry，不用 GHCR**
   - GHCR 在中国不稳定
   - Harbor 部署在阿里云本机，pull 走 localhost

2. **阿里云 hosts 映射**
   - `/etc/hosts`: `127.0.0.1 harbor.codetrek.cn`
   - docker pull 走本机 Caddy → Harbor，不走公网

3. **Prod tag 用 Harbor API 而不是 pull+retag+push**
   ```bash
   curl -sf -u '<user>:<token>' \
     -X POST 'https://harbor.codetrek.cn/api/v2.0/projects/library/repositories/<app>/artifacts/<build-tag>/tags' \
     -H 'Content-Type: application/json' \
     -d '{"name":"prod"}'
   ```
   - 秒完成，不下载 200MB 镜像

4. **Compose 用完整 Harbor URL**
   ```yaml
   image: harbor.codetrek.cn/library/collab:staging  # 不做本地 retag
   ```

5. **Secrets 和 Variables 分离**
   - `vars.REGISTRY`: harbor.codetrek.cn（公开信息，放 variable）
   - `vars.HARBOR_USER`: robot 账号用户名（放 variable）
   - `secrets.HARBOR_API_TOKEN`: robot 账号 token（放 secret）
   - `secrets.ALIYUN_SSH_KEY`: 部署 SSH 密钥（放 secret）

6. **Robot Account 用户名含 `$` 号**
   - 格式: `robot$library+github-ci`
   - Workflow 里必须用**单引号**包裹，防止 shell 展开 `$library`
   - 双引号会导致 `$library` 被解析为空 → 认证失败

### Pipeline 流程
```
push main
  → test (pnpm install + build + vitest)
  → deploy-staging
      - docker build -t <registry>/<image>:<timestamp> -t <registry>/<image>:staging
      - docker push (两个 tag)
      - SSH 阿里云: docker compose pull && up -d && health check && prune
  → [等待 approve]
  → deploy-prod
      - Harbor API 给 <timestamp> 镜像加 :prod tag
      - SSH 阿里云: docker compose pull && up -d && health check && prune
      - 打 git tag v<timestamp>
```

### 踩过的坑
- 阿里云内存不足无法 Docker build → CI runner build + push Harbor
- GitHub Actions artifact 有 org 级 500MB 存储限制 → 用 Harbor 替代
- `robot$xxx` 在 bash 双引号里被展开 → 用单引号
- Harbor install.sh 需要 `docker-compose` V1 命令 → 临时 wrapper
- Harbor `prepare` 容器生成的文件权限可能不对 → 手动 chmod
- `docker compose down -v` 不影响 bind mount，但重启可能导致 DB 连接顺序问题
