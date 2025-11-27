/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POLL_SERVICE_URL?: string;
  readonly VITE_OPTION_SERVICE_URL?: string;
  readonly VITE_VOTE_SERVICE_URL?: string;
  // Legacy support
  readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
