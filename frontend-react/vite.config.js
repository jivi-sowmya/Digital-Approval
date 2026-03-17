import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          reactVendor: ["react", "react-dom", "react-router-dom"],
          docViewer: ["docx-preview"]
        }
      }
    }
  }
});
