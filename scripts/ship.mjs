#!/usr/bin/env node
import { execSync } from 'node:child_process'

function run(cmd, desc) {
  process.stdout.write(`\n⏳ ${desc}...\n`)
  try {
    execSync(cmd, { stdio: 'inherit' })
  } catch (err) {
    console.error(`\n❌ Error during: ${desc}`)
    process.exit(1)
  }
}

// 1. Verify build
run('npm run build', 'Verifying code and building production bundle')

// 2. Stage changes
run('git add -A', 'Staging modified files')

// 3. Check if there is anything to commit
let status = ''
try {
  status = execSync('git status --porcelain', { encoding: 'utf8' }).trim()
} catch {}

if (!status) {
  console.log('\n✨ Everything is up to date! No changes to commit.')
  process.exit(0)
}

// 4. Formulate commit message
const userMessage = process.argv.slice(2).join(' ').trim()
const now = new Date()
const timeStr = now.toISOString().replace('T', ' ').slice(0, 16)
const commitMsg = userMessage || `Kiai update (${timeStr})`

run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, `Creating commit: "${commitMsg}"`)

// 5. Push to GitHub
run('git push origin main', 'Uploading to GitHub (main branch)')

console.log(`\n🚀 Successfully updated GitHub repository: https://github.com/sa-boop2/Kiai\n`)
