# Steam 封面获取器

一个现代化的 Next.js 应用，用于快速获取 Steam 游戏的高质量封面图片。

## ✨ 特性

- 🎮 **Steam 封面获取**: 支持通过游戏 ID 或链接获取多种尺寸的封面图片
- 🎨 **现代化 UI**: 基于 Tailwind CSS 的精美界面设计
- 📱 **响应式设计**: 完美适配桌面端、平板和移动设备
- 🌊 **瀑布流布局**: 优雅的图片展示方式
- ✨ **丰富动画**: 流畅的页面动画和交互效果
- 🚀 **高性能**: 基于 Next.js 14 的现代化架构
- 📋 **一键复制**: 点击图片即可复制链接到剪贴板
- 🎯 **TypeScript**: 完整的类型安全支持

https://github.com/user-attachments/assets/044e86d0-25e3-4f41-b14b-319b6cf7e208

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
# 或
yarn build
yarn start
```

## 📖 使用说明

1. **输入游戏信息**: 在搜索框中输入 Steam 游戏 ID 或完整的 Steam 商店链接
2. **获取封面**: 点击"获取封面"按钮开始获取
3. **预览图片**: 系统会自动获取多种尺寸的封面图片
4. **复制链接**: 点击任意图片即可复制其链接到剪贴板
5. **查看帮助**: 点击"使用帮助"按钮了解更多详细信息

### 支持的输入格式

- **游戏 ID**: `730` (Counter-Strike 2)
- **Steam 链接**: `https://store.steampowered.com/app/730/CounterStrike_2/`
- **简短链接**: `store.steampowered.com/app/730`

### 可获取的封面类型

封面优先通过 Steam `IStoreBrowseService/GetItems` 返回的资源路径获取, 支持哈希目录、活动替换图及接口提供的 2x 高清版本. 单张图片加载失败时依次尝试原始资源和旧 CDN 地址; 元数据接口不可用时保留旧地址获取方式. Steam 未提供且旧地址也不可用的图片不会展示.

预览、复制链接和 ZIP 下载均使用实际加载成功的图片地址, 并保留 Steam 的版本查询参数. ZIP 文件扩展名根据实际资源路径确定.

- **Header**: 460×215 横幅图片
- **Capsule SM**: 231×87 小胶囊图片
- **Capsule MD**: 616×353 中等胶囊图片
- **Capsule LG**: 467×181 大胶囊图片
- **Library Hero**: 3840×1240 库页面英雄图片
- **Library Logo**: 游戏标志图片
- **Page BG**: 页面背景图片

## 🛠️ 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: CSS Animations + Framer Motion
- **图标**: Heroicons
- **部署**: Vercel (推荐)

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   └── ui/               # UI 组件库
│       ├── Button.tsx    # 按钮组件
│       ├── Card.tsx      # 卡片组件
│       ├── Input.tsx     # 输入框组件
│       ├── Loading.tsx   # 加载动画组件
│       ├── Modal.tsx     # 模态框组件
│       ├── Toast.tsx     # 通知组件
│       └── index.ts      # 组件导出
├── lib/                  # 工具函数
│   └── utils.ts         # 通用工具
├── types/               # TypeScript 类型定义
│   └── index.ts        # 类型导出
└── utils/              # 业务工具函数
    └── steam.ts        # Steam API 相关
```

## 🎨 设计系统

### 颜色主题

- **主色调**: 蓝色渐变 (#3B82F6 → #8B5CF6)
- **背景**: 深色渐变 (slate-900 → purple-900)
- **文字**: 白色/灰色层次
- **强调色**: 紫色 (#8B5CF6)

### 动画效果

- **缓动曲线**: cubic-bezier(0.34, 1.56, 0.64, 1) (先快后慢)
- **页面加载**: 淡入上移动画
- **卡片悬浮**: 轻微上浮效果
- **按钮交互**: 弹性缩放动画

## 🔧 自定义配置

### 修改 Steam API 端点

编辑 `src/utils/steam.ts` 文件中的 API 配置：

```typescript
const STEAM_API_BASE = 'https://store.steampowered.com/api'
```

### 添加新的封面类型

在 `src/types/index.ts` 中扩展 `SteamVariant` 类型：

```typescript
export type SteamVariant = 
  | 'header' 
  | 'capsule_sm' 
  | 'capsule_md'
  // 添加新类型
  | 'new_variant'
```

## 🚀 部署

### Vercel 部署 (推荐)

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 自动部署完成

### 其他平台

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Steam](https://store.steampowered.com/) - 提供游戏数据 API
- [Next.js](https://nextjs.org/) - 优秀的 React 框架
- [Tailwind CSS](https://tailwindcss.com/) - 实用的 CSS 框架
- [Heroicons](https://heroicons.com/) - 精美的图标库

---

**享受使用 Steam 封面获取器！** 🎮✨

## 📢 广告与变现（可选）

本项目内置 Google AdSense 支持（生产环境生效）。

- Ads 脚本已在根布局按生产环境注入
- 首页包含 3 个广告位：
  - 搜索卡片左、右各一个矩形位（300×250，桌面端显示）
  - 页脚上方 1 个横幅位（全宽，90 高）
- 开发环境会显示占位，不会实际请求广告，避免布局抖动

### 环境变量

在部署平台设置以下变量：

- NEXT_PUBLIC_SITE_URL: 站点完整地址，如 https://steamcover.laogou717.com
- NEXT_PUBLIC_ADSENSE_CLIENT: 您的 AdSense client，例如 ca-pub-XXXXXXXXXXXXXXX
- NEXT_PUBLIC_ADSENSE_SLOT_RECT: 矩形广告单元 ID
- NEXT_PUBLIC_ADSENSE_SLOT_BANNER: 横幅广告单元 ID

### ads.txt 放置

- 在站点根目录的 /ads.txt 放置发布商授权，例如：
  google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0
- 如果使用子域名部署，请确保该子域也能通过 https://子域/ads.txt 访问。
  如需在根域引用子域的 ads.txt，可在根域 ads.txt 中添加指向子域的记录或使用重定向（以 Google 文档为准）。

## 🌐 SEO 与多语言

- 站点默认中文，支持英文（?lang=en）
- 已在 metadata.alternates 中声明 hreflang：zh 对应 /，en 对应 /?lang=en
- 站点地图（/sitemap.xml）同时包含中/英链接
- Robots 配置允许抓取并暴露 sitemap

## 🧩 自定义广告位样式

广告容器使用组件 src/components/ads/AdSlot.tsx：

- format: rectangle | horizontal | auto（仅用于占位样式）
- slot: 广告单元 ID，生产环境建议配置；未配置时渲染对齐占位
- responsive: 启用自适应横幅（默认 true）
- showPlaceholderInDev: 开发环境显示占位（默认 true）

示例：

```tsx
<AdSlot className="w-full" format="horizontal" slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER} />
```

## 🛫 部署子域名

- 将 NEXT_PUBLIC_SITE_URL 设置为最终访问地址（例如：https://steamcover.laogou717.com）
- 确保该地址可被搜索引擎访问，部署完成后刷新 sitemap 和 robots
- 建议在部署平台配置 301 将不带 www 的域名重定向到主域，保持唯一 URL
