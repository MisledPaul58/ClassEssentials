import { defineConfig } from 'astro/config';

// Configuración oficial de ClassEssentials.
// La web se publica como proyecto de GitHub Pages: https://misledpaul58.github.io/ClassEssentials/
export default defineConfig({
  site: 'https://misledpaul58.github.io',
  base: '/ClassEssentials',
  build: {
    // Carpeta de assets generados (con hash de caché automático)
    assets: '_assets'
  },
  devToolbar: {
    enabled: false
  }
});
