---
name: mockup-ui
description: >
  创建和管理 Mockup UI 原型。使用 show-me-it 基建平台展示 UI mockup 给建军看。
  触发场景：(1) 建军说「做个 XXX 的 mockup」「看看 XXX 长什么样」「UI 原型」
  (2) 讨论阶段需要可视化展示 UI 方案
  (3) 需要修改/迭代已有 mockup
  不适用于：生产环境前端开发、组件库建设。
---

# Mockup UI

用 show-me-it 平台快速出 UI 原型，在线展示给建军看。

## 基建信息

- **代码目录**：`/workspace/show-me-it`
- **线上地址**：`https://mockup.codetrek.work`
- **技术栈**：Next.js + Tailwind，纯静态导出
- **注册表**：`/workspace/show-me-it/mockup-registry.json`

## 链路

```
mockup.codetrek.work → Cloudflare CDN (proxied) → Host Caddy (file_server) → /srv/mockup (volume mount 到 out/)
```

无额外进程。build 后 `out/` 目录自动更新，刷新浏览器即生效，无需部署。

## 创建 mockup 流程

### 1. 写页面

在 `src/app/{项目名}/{mockup名}/page.tsx` 下创建页面。

- 项目名和 mockup 名用 kebab-case
- 用 Tailwind 做样式，风格现代、深色主题（与现有页面一致）
- 可以 import `src/components/` 下的共享组件

### 2. 注册到 registry

更新 `mockup-registry.json`：

```json
{
  "projects": {
    "项目名": {
      "label": "项目显示名",
      "mockups": {
        "mockup名": {
          "label": "Mockup 显示名",
          "description": "一句话描述",
          "author": "作者",
          "date": "YYYY-MM-DD",
          "status": "draft"
        }
      }
    }
  }
}
```

### 3. Build

```bash
cd /workspace/show-me-it && npm run build
```

build 成功后 `out/` 自动更新，线上即时生效。

### 4. 发链接

在讨论频道发：`https://mockup.codetrek.work/{项目名}/{mockup名}`

### 5. 迭代

建军反馈 → 改代码 → `npm run build` → 刷新即见。

## 全局 Layout 约束

全局 layout (`src/app/layout.tsx`) 有一个 **sticky header**（`sticky top-0 z-50 h-14`，显示 "🎨 Show Me It" logo）。

所有 mockup 页面的 UI 元素**不得遮挡这个 header**：

- **禁止**在 `top-0` ~ `top-14`（0~56px）区域放置 fixed/sticky 元素（会盖住全局 header）
- 如果 mockup 有自己的 sidebar/hamburger 按钮，定位必须在 header 下方（`top-14` 或 `top-[4rem]` 起步）
- 移动端 sidebar overlay 打开时，sidebar 面板从 `top-14` 开始，不从 `top-0`
- 桌面端 sidebar 可以从 `top-0` 开始（`lg:top-0`），因为桌面端 sidebar 是常驻的

## 验证 Checklist

写完 mockup 后必须检查：
- [ ] 桌面端（≥1024px）：全局 header 可见，mockup 布局正常
- [ ] 移动端（<1024px）：hamburger 按钮不遮挡 "🎨 Show Me It"，sidebar 收起时 header 完整可见
- [ ] 点击 hamburger → sidebar 悬浮打开，点遮罩/✕ 关闭
- [ ] sidebar 导航项点击后自动收起（移动端）

## 注意事项

- **不装额外依赖**——用现有的 Next.js + Tailwind
- **动态路由要 generateStaticParams**——新项目/mockup 必须注册到 registry，否则 build 不会生成页面
- **git commit 但不影响部署**——push 只是版本记录
- **mockup 里不放真实数据**——用 placeholder / 假数据
