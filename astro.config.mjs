// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import fotosOcultas from './integraciones/fotos-ocultas';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages: https://santigarh.github.io/rocket/
  site: 'https://santigarh.github.io',
  base: '/rocket',
  integrations: [fotosOcultas()],
  vite: {
    plugins: [tailwindcss()]
  }
});
