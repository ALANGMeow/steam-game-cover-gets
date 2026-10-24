/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  images: {
    domains: ['cdn.akamai.steamstatic.com'],
    unoptimized: true,
  },
  // 明确指定工作区根目录，消除多 lockfile 引发的 workspace root 警告
  outputFileTracingRoot: path.join(__dirname),
}

module.exports = nextConfig