import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Project site: https://j35t312.github.io/12CycleWeeks/
export default defineConfig({
  base: '/12CycleWeeks/',
  plugins: [react()],
})
