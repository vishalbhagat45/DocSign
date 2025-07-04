import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ No need to import tailwindcss manually here!
export default defineConfig({
  plugins: [react()],
  server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}

})
