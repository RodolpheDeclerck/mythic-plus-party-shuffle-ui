/** @type {import('next').NextConfig} */
// CRA (main) used REACT_APP_API_URL; Next.js expects NEXT_PUBLIC_API_URL.
// Expose a single client-side value so existing Render/env from main keeps working.
const resolvedPublicApiUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8080'

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: resolvedPublicApiUrl,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig

