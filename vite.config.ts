import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["react", "react-dom", "echarts", "zustand", "lucide-react"],
  },
  server: {
    port: 3000,
    open: true,
  },
});
