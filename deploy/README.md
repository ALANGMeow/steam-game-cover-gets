# Google Cloud 部署

公开地址: https://steamcover.alang.love.

采用 Nginx + Next.js 生产服务. Nginx 直接提供 `/_next/static/` 下的 JS、CSS、字体, 页面由 Next.js 提供, `/` 和 `/about` 在构建时预生成. `/api/appinfo`、`/api/search` 及动态分享路由保留服务端处理. 前端调用同域 API, 不直接跨域读取 Steam 元数据接口.

## 目录和服务

- Node.js 22 官方 Linux x64 运行时, `/usr/local/bin/node` 指向 `/opt/node-v22.23.4-linux-x64/bin/node`.
- 版本目录: `/opt/steamcover/releases/<release>/`, 当前版本符号链接: `/opt/steamcover/current`.
- 独立用户 `steamcover`, systemd 服务 `steamcover.service`, 仅监听 `127.0.0.1:3017`.
- Nginx: `/etc/nginx/sites-available/steamcover.alang.love`, 同名 `sites-enabled` 链接.
- 独立证书: `/etc/letsencrypt/live/steamcover.alang.love/`, HTTP-01 webroot `/var/www/steamcover-acme`.
- 证书续期后通过 `/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh` 检查并重载 Nginx.
- 日志: `journalctl -u steamcover`, `/var/log/nginx/steamcover.access.log`, `/var/log/nginx/steamcover.error.log`.

## 更新原则

1. 在本地 Node.js 22 环境安装锁定依赖, 设置 `NEXT_PUBLIC_SITE_URL=https://steamcover.alang.love` 后执行 `npm run build`.
2. 上传 `.next` (排除 `cache`)、`public`、`package.json`、`package-lock.json`、`next.config.js`、`.npmrc`、`deploy` 到新的版本目录. 不上传本地 `node_modules` 或环境变量文件.
3. 在 Linux 版本目录执行 `npm ci --omit=dev --ignore-scripts --no-audit --no-fund`, 安装 Linux 依赖. Windows 构建输出使用的 JS、HTML 和静态资源可直接部署, 原生依赖在 Linux 单独安装.
4. 版本文件由 root 所有且可读; 仅 `.next/cache` 交给 `steamcover` 写入. 保留旧版本和上传归档.
5. 切换 `current` 后重启 `steamcover.service`, 验证首页、搜索、新游戏封面与 Logo、ZIP、HTTPS 和 SEO.

首次安装还需安装 Node.js、建立服务用户、复制本目录中的 systemd/Nginx 配置和证书续期 hook, 并为子域名配置 Cloudflare 橙云 A 记录及签发证书. Nginx 配置启用前必须保证证书已经存在. 现有 `alang.love` 和 HTTP relay 配置独立保留.

常用维护命令:

```bash
systemctl status steamcover --no-pager
journalctl -u steamcover -n 100 --no-pager
nginx -t
systemctl reload nginx
certbot renew --cert-name steamcover.alang.love --dry-run --no-random-sleep-on-renew
```

此目录是部署配置和操作说明, 服务器的当前实际状态另见 Tools 工作区中的服务器记录.
