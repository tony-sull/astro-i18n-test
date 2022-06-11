import { defineConfig } from 'astro/config'
import i18n from './src/i18n'

export default defineConfig({
  experimental: {
    integrations: true,
  },
  integrations: [
    i18n({
      resourcesPath: './lang/',
      i18next: {
        debug: false,
        supportedLngs: ['en', 'ja'], // ℹ️ base language is the first one, ie. "en"
      },
    }),
  ],
})
