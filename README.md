# Steam 封面获取器

一个通过 Steam AppID、商店链接或游戏名称获取游戏图片的工具. 本版本由 [ALANGMeow](https://github.com/ALANGMeow) 维护, 基于原始项目进行迭代.

仓库: [ALANGMeow/steam-game-cover-gets](https://github.com/ALANGMeow/steam-game-cover-gets).

## 功能

- 支持输入 AppID、Steam 商店链接, 或按游戏名称搜索.
- 获取横幅、竖版封面、库背景、透明 Logo 及资源接口提供的 2x 高清版本.
- 展示图片的实际尺寸, 点击图片复制真实链接.
- 将已加载的图片打包为 ZIP, 保留实际文件扩展名和游戏名称.
- 支持中文、英文界面及响应式瀑布流预览.

## 快速开始

本地已使用 Node.js 22 构建验证. 使用 npm 和仓库中的锁文件安装依赖:

```bash
npm ci
npm run dev
```

开发服务器默认地址为 http://localhost:3000.

生产构建和启动:

```bash
npm run build
npm start
```

生产服务通过 Nginx 反向代理接入域名, JS/CSS 等静态资源由 Nginx 直接提供. 应用包含服务端 API, 不能仅部署为静态文件. 详见 [Google Cloud 部署说明](deploy/README.md).

## 使用说明

支持的输入示例:

- AppID: `730`
- Steam 商店链接: `https://store.steampowered.com/app/4656000/BOMBANANA/`
- 游戏名称: `BOMBANANA`

输入后点击获取封面. 图片加载成功后可点击复制链接, 或使用 ZIP 按钮下载全部已加载图片. Steam 未提供且回退地址也不可用的图片不会展示.

## 资源获取方式

封面优先使用 Steam `IStoreBrowseService/GetItems` 返回的真实资源路径, 支持哈希目录、活动替换图及接口提供的高清版本. 单张图片失败时依次尝试原始资源和旧 CDN 地址; 商店元数据不可用时保留旧地址获取方式.

Library Logo 的哈希路径不包含在该商店接口响应中, 因此使用第三方 [SteamCMD appinfo 镜像](https://www.steamcmd.net/) 补充 `library_assets_full.library_logo` 元数据. 镜像仅接收公开 AppID, 图片仍直接从 Steam CDN 获取. 补充查询与商店查询并行, 有 4 秒超时和 10 分钟缓存; 镜像不可用时保留旧 Logo 地址.

预览、复制和 ZIP 下载均使用实际加载成功的图片地址. 所有图片保留 Steam 提供的版本查询参数, ZIP 扩展名按实际资源路径确定.

## 站点与 SEO 配置

正式地址: https://steamcover.alang.love. 分享预览图使用 `Steam Cover` 品牌名.

部署时在构建前配置 `NEXT_PUBLIC_SITE_URL`, 值为最终完整公开地址. 可通过环境变量或本地 `.env.local` 文件设置. 未配置时默认使用 `https://steamcover.alang.love`; 本地预览可覆盖为 `http://localhost:3000`.

该配置用于 canonical、Open Graph URL、站点地图、robots 和结构化数据. 修改后需要重新构建. 站点包含 `/sitemap.xml`、`/robots.txt` 和社交预览相关路由; 首页没有单独的分享按钮.

## 项目结构

```text
src/
├── app/
│   ├── api/appinfo/route.ts      # 游戏名称、封面与 Logo 元数据
│   ├── api/search/route.ts       # 名称联想搜索
│   ├── about/page.tsx           # 项目介绍、来源与反馈
│   └── page.tsx                 # 封面预览、复制与 ZIP 下载
├── components/
│   ├── layout/                  # 导航栏、页脚与语言状态
│   └── ui/                      # 通用界面组件
├── lib/
│   ├── site.ts                  # 维护者、仓库链接与站点信息
│   ├── steam-assets.ts          # 真实资源路径及回退解析
│   └── utils.ts                 # AppID 解析和通用工具
└── types/index.ts              # 接口及图片类型
```

技术栈: Next.js 15.5.28、React 18、TypeScript、Tailwind CSS、Framer Motion、Font Awesome、JSZip.

## 反馈与贡献

请在[本仓库](https://github.com/ALANGMeow/steam-game-cover-gets)提交 Issue 或 Pull Request.

## 许可证与资源归属

原项目在 README 中声明采用 MIT 许可证, 但上游目前没有提供独立的 LICENSE 文件. 本仓库保留原作来源和署名; 原始代码版权归原作者 laogou717 所有.

游戏图片及商标归各自权利人所有. 本项目是独立维护的第三方工具, 与 Valve 或游戏发行商无隶属或背书关系. Steam and the Steam logo are trademarks of Valve Corporation.

## 致谢

- [laogou717](https://github.com/laogou717) - [原始项目 Steam-game-cover-gets](https://github.com/laogou717/Steam-game-cover-gets), 提供本项目的初始实现.
- [Steam](https://store.steampowered.com/) - 提供游戏元数据及图片资源.
- [SteamCMD appinfo 镜像](https://www.steamcmd.net/) - 补充客户端资源元数据.
- [Next.js](https://nextjs.org/)、[React](https://react.dev/)、[Tailwind CSS](https://tailwindcss.com/)、[Framer Motion](https://motion.dev/)、[Font Awesome](https://fontawesome.com/) 和 [JSZip](https://stuk.github.io/jszip/) - 提供应用所使用的框架与组件.
