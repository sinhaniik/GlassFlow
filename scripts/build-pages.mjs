import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const dist = join(root, 'dist')
const docs = join(root, 'docs')

execSync('npm run build', { cwd: root, stdio: 'inherit' })

rmSync(docs, { recursive: true, force: true })
mkdirSync(docs)
cpSync(dist, docs, { recursive: true })
writeFileSync(join(docs, '.nojekyll'), '\n')

console.log('✓ Production build copied to docs/ — commit and push, then set Pages to /docs')