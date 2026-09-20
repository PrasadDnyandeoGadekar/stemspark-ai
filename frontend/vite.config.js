import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Forces the server to open to the external network
    strictPort: true,
    port: 5173 ,
    allowedHosts: true // Prevents GitHub Codespace blocks
  }
})