import { pfxReleasePlugin } from "../../scripts/pfx-release.mjs";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react(), pfxReleasePlugin()],
  // Keep local previews at / and publish the site at the repository subpath.
  base: mode === 'pages' ? '/pfx-interaction-playground/' : '/',
}));
