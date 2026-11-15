import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? listFiles(full) : [full]
  })
}

/**
 * After the build, generates dist/sw.js from scripts/sw.template.js.
 * The list of every built file is injected so the whole app is pre-cached
 * on first load and works offline afterwards.
 */
function offlineServiceWorker(): Plugin {
  let root = process.cwd()
  let outDir = 'dist'
  return {
    name: 'offline-service-worker',
    apply: 'build',
    configResolved(config) {
      root = config.root
      outDir = join(config.root, config.build.outDir)
    },
    closeBundle() {
      const skip = new Set(['sw.js', '_headers', '_redirects'])
      const files = listFiles(outDir)
        .map((f) => relative(outDir, f).split(sep).join('/'))
        .filter((f) => !skip.has(f))
        .sort()
      const hash = createHash('sha256')
      for (const f of files) hash.update(f).update(readFileSync(join(outDir, f)))
      const template = readFileSync(join(root, 'scripts/sw.template.js'), 'utf8')
      const sw = template
        .replace('__VERSION__', hash.digest('hex').slice(0, 12))
        .replace('__PRECACHE__', JSON.stringify(files, null, 2))
      writeFileSync(join(outDir, 'sw.js'), sw)
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), offlineServiceWorker()],
})
