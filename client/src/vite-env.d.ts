/// <reference types="vite/client" />

/** Typed build-time environment. Only VITE_-prefixed vars reach the browser. */
interface ImportMetaEnv {
  /**
   * Absolute base URL for the API. Leave unset for the normal deployment,
   * where the API is same-origin (Vercel) or proxied by Vite (dev). Set it only
   * when the server is deployed separately.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
