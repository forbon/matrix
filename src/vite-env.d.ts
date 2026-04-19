/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface MatrixConfig {
  impressumUrl?: string;
  privacyUrl?: string;
}

interface Window {
  __MATRIX_CONFIG__?: MatrixConfig;
}
