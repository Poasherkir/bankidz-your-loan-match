import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      // Stub out any SSR-only @tanstack/react-start imports so the app
      // builds as a pure client-side SPA (needed for Capacitor / Android).
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
