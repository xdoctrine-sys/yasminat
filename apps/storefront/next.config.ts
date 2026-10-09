import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || process.env.MEDUSA_BACKEND_URL || '';
let backendHost = null;
try { if (backendUrl) backendHost = new URL(backendUrl).hostname; } catch {}
const backendIsLocal = backendHost === '127.0.0.1' || backendHost === 'localhost';
const allowLocalFileBackend = !isDev ? backendIsLocal : true;

const remotePatterns: NextConfig['images']['remotePatterns'] = [
  {
    protocol: 'https',
    hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com'
  },
  {
    protocol: 'https',
    hostname: 'mercur-connect.s3.eu-central-1.amazonaws.com'
  },
  {
    protocol: 'https',
    hostname: 'api.mercurjs.com'
  },
  {
    protocol: 'https',
    hostname: 'api-sandbox.mercurjs.com',
    pathname: '/static/**'
  },
  {
    protocol: 'https',
    hostname: 'i.imgur.com'
  },
  {
    protocol: 'https',
    hostname: 's3.eu-central-1.amazonaws.com'
  },
  {
    protocol: "https",
    hostname: "mercur-testing.up.railway.app",
  },
];

if (allowLocalFileBackend) {
  remotePatterns.push(
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '9000',
      pathname: '/static/**'
    },
    {
      protocol: 'http',
      hostname: '127.0.0.1',
      port: '9000',
      pathname: '/static/**'
    }
  );
}

// TODO(infra): remplacer le wildcard "**" par le hostname exact du bucket S3/R2 de production
// (ex: yasminat-production-cdn.cloudflare.net) dès que le stockage durable est configuré.
remotePatterns.push({
  protocol: 'https',
  hostname: '**'
});

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: false,
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
