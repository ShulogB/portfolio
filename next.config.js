/** @type {import('next').NextConfig} */
const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
let apiUrl;
try {
  apiUrl = new URL(apiBase);
} catch {
  apiUrl = new URL("http://localhost:8000");
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", ""),
        hostname: apiUrl.hostname,
        port: apiUrl.port || "",
        pathname: "/media/**",
      },
    ],
  },
};

module.exports = nextConfig;
