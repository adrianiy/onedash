// @ts-check
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,

  // Configuración de API y rutas
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },

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

  // Configuración para Vercel
  output: "standalone",

  // Configuración de webpack para excluir la carpeta src
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Excluir la carpeta src del bundle del servidor
      config.externals = config.externals || [];
      config.externals.push({
        "./src": "commonjs ./src",
      });
    }
    return config;
  },
};

export default nextConfig;
