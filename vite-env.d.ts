/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  // Add other Vite env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 