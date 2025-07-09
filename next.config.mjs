// @ts-check
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  // Permitir que Next.js sirva archivos estáticos desde la carpeta public
  images: {
    domains: ["localhost"],
  },

  // Variables de entorno
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || "onedash-jwt-secret-key",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",
  },

  // Configuración para transpilación de módulos
  transpilePackages: ["echarts", "echarts-for-react", "zrender"],

  // Configuración para webpack
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
