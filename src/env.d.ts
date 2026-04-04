/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAS_URL: string
  readonly VITE_PASS_THRESHOLD: string
  readonly VITE_QUESTION_COUNT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
