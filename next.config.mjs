import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // This is the polling configuration to fix file watching on some systems.
    if (!isServer) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      };
    }
    return config;
  },
  // This is to allow access from other devices on your network.
  // The port might be different if you are not using 3000.
  // This was moved from `experimental` in recent Next.js versions.
  allowedDevOrigins: ["http://192.168.11.81:3000"],
};

export default withPWA(nextConfig);
