import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const nextConfig = {
  allowedDevOrigins: ['10.239.4.36'],
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  headers() {
    const headers=[{key:'Cache-Control',value:'private, no-store, max-age=0'},{key:'X-Frame-Options',value:'DENY'},{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'no-referrer'},{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'}];
    return [{source:'/admin/:path*',headers},{source:'/api/admin/:path*',headers}];
  },
};

export default nextConfig;
