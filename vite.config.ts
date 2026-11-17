import react from '@vitejs/plugin-react'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')) as {
  version: string
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

/**
 * After the build, list every emitted file and inject the list (plus a
 * content hash used as the cache version) into dist/service-worker.js.
 */
function precacheServiceWorker(): Plugin {
  let outDir = ''
  return {
    name: 'precache-sw',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const swPath = join(outDir, 'service-worker.js')
      const files = walk(outDir)
        .map((f) => relative(outDir, f).split(sep).join('/'))
        .filter((f) => f !== 'service-worker.js' && f !== '_headers' && !f.endsWith('.map'))
        .sort()

      const hash = createHash('sha256')
      for (const f of files) {
        hash.update(f)
        hash.update(readFileSync(join(outDir, f)))
      }
      const buildId = hash.digest('hex').slice(0, 12)

      const list = ['./', ...files]
      const src = readFileSync(swPath, 'utf-8')
        .replace('__BUILD_ID__', buildId)
        .replace('/*__PRECACHE__*/ []', JSON.stringify(list))
      writeFileSync(swPath, src)
      console.log(`\n[precache-sw] ${list.length} files cached, build id ${buildId}`)
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), precacheServiceWorker()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  build: { target: 'es2020', assetsInlineLimit: 0 },
})
