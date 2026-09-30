import type { NextConfig } from "next";

const securityHeaders=[
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
  {key:"Cross-Origin-Opener-Policy",value:"same-origin"},
  {key:"Strict-Transport-Security",value:"max-age=63072000; includeSubDomains; preload"}
];

const nextConfig: NextConfig = {
  poweredByHeader:false,
  experimental:{serverActions:{bodySizeLimit:"5mb"}},
  images:{remotePatterns:[{protocol:"https",hostname:"**"}]},
  async headers(){return [
    {source:"/sw.js",headers:[{key:"Cache-Control",value:"no-cache, no-store, must-revalidate"},{key:"Service-Worker-Allowed",value:"/"}]},
    {source:"/:path*",headers:securityHeaders}
  ]}
};

export default nextConfig;
