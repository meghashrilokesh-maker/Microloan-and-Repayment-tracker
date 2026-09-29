import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

export default defineConfig(({ mode }) => {
  // Load environment variables from both the repo root and client directory
  const rootEnv = loadEnv(mode, rootDir, ['VITE_'])
  const clientEnv = loadEnv(mode, __dirname, ['VITE_'])
  const env = { ...rootEnv, ...clientEnv, ...process.env }

  const supabaseUrl = env.VITE_SUPABASE_URL || ''
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || ''

  return {
    plugins: [react()],
    envPrefix: ['VITE_'],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(supabaseKey),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})

