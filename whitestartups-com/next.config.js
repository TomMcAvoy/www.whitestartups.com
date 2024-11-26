import { withPayload } from '@payloadcms/next/withPayload'
import redirects from './redirects.js'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
console.log('NEXT_PUBLIC_SERVER_URL:', NEXT_PUBLIC_SERVER_URL)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        const url = new URL(item)
        console.log('URL:', url)
        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['@components'] = path.resolve('src/components')
    config.resolve.alias['@custom_components'] = path.resolve('src/components/Custom_components')
    config.resolve.alias['@custom_pages'] = path.resolve('src/custom_pages')
    config.resolve.alias['@styles'] = path.resolve('src/styles')
    config.resolve.alias['@workers'] = path.resolve('src/workers')
    config.resolve.alias['@utils'] = path.resolve('src/utils')
    config.resolve.alias['@hooks'] = path.resolve('src/hooks')
    config.resolve.alias['@contexts'] = path.resolve('src/contexts')
    config.resolve.alias['@services'] = path.resolve('src/services')
    config.resolve.alias['@assets'] = path.resolve('src/assets')
    config.resolve.alias['@providers'] = path.resolve('src/providers')
    config.resolve.alias['@endpoints'] = path.resolve('src/endpoints')
    config.resolve.alias['@plugins'] = path.resolve('src/plugins')
    config.resolve.alias['@access'] = path.resolve('src/access')
    config.resolve.alias['@fields'] = path.resolve('src/fields')
    config.resolve.alias['@blocks'] = path.resolve('src/blocks')
    config.resolve.alias['@collections'] = path.resolve('src/collections')
    config.resolve.alias['@search'] = path.resolve('src/search')
    config.resolve.alias['@localtypes'] = path.resolve('src/types')
    config.resolve.alias['@app'] = path.resolve('src/app')
    config.resolve.alias['@heros'] = path.resolve('src/heros')
    config.resolve.alias['@middleware'] = path.resolve('src/middleware')
    return config
  },
  redirects,
}

export default withPayload(nextConfig)
