import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Vite config used for the Capacitor / Android static SPA build.
// Does NOT use @lovable.dev/vite-tanstack-config or Cloudflare Workers.
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      // Replace SSR-only @tanstack/react-start exports with client-safe stubs
      "@tanstack/react-start": path.resolve(
        __dirname,
        "src/lib/tanstack-start-stub.ts"
      ),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
