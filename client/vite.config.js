import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

export default defineConfig(({ mode }) => {
  // Load environment variables from both the repo root and client directory
  const rootEnv = loadEnv(mode, rootDir, ['VITE_'])
  const clientEnv = loadEnv(mode, __dirname, ['VITE_'])
  const env = { ...rootEnv, ...clientEnv, ...process.env }

  // Safe diagnostics (keys only, no secrets or values)
  const matchingKeys = Object.keys(process.env).filter(
    k => k.includes('SUPABASE') || k.startsWith('VITE_') || k.startsWith('NEXT_PUBLIC_')
  )
  console.log(`[Vite Build] VERCEL_ENV: ${process.env.VERCEL_ENV || 'undefined'}`)
  console.log(`[Vite Build] VERCEL_GIT_COMMIT_REF: ${process.env.VERCEL_GIT_COMMIT_REF || 'undefined'}`)
  console.log(`[Vite Build] Matching env keys in process.env: ${JSON.stringify(matchingKeys)}`)

  const supabaseUrl = env.VITE_SUPABASE_URL || ''
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || ''

  try {
    const meta = {
      vercelEnv: process.env.VERCEL_ENV || 'local',
      gitRef: process.env.VERCEL_GIT_COMMIT_REF || '',
      matchingKeys,
      hasSupabaseUrl: Boolean(supabaseUrl && supabaseUrl.trim()),
      hasSupabaseKey: Boolean(supabaseKey && supabaseKey.trim()),
      timestamp: new Date().toISOString()
    }
    fs.writeFileSync(path.resolve(__dirname, 'public', 'build-meta.json'), JSON.stringify(meta, null, 2))
  } catch (e) {}

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

