/** @type {import('next').NextConfig} */
const nextConfig = {
  // ปิด warning เกี่ยวกับ CSS preloading
  experimental: {
    optimizeCss: false,
  },

  // หรือปรับ webpack config
  webpack: (config, { dev, isServer }) => {
    // ปิด preload warnings ใน development
    if (dev && !isServer) {
      config.devtool = 'eval-source-map';
    }
    return config;
  },

  // ปิด warning logs ที่ไม่จำเป็น
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
