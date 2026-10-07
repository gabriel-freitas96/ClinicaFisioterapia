import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, 
      devOptions: {
        enabled: false
      },
      manifest: {
        name: 'Clínica Fisio',
        short_name: 'Fisio',
        description: 'Sistema de gestão para a Clínica Fisio',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone'
      }
    })
  ]
});