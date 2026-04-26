// Stubs for @tanstack/react-start SSR-only exports.
// Used by vite.mobile.config.ts so the app builds as a pure client-side SPA
// without requiring a Node/Cloudflare server for rendering.
export {
  createRootRoute,
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
  useRouter,
  useParams,
  useSearch,
} from "@tanstack/react-router";

export const HeadContent = () => null;
export const Scripts = () => null;
