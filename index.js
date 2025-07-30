#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🧪 Setting up Prettier config files...')

const filesToCopy = {
  '.prettierrc': 'template/.prettierrc',
  '.prettierignore': 'template/.prettierignore',
  '.vscode/settings.json': 'template/.vscode/settings.json',
}

Object.entries(filesToCopy).forEach(([target, src]) => {
  const destPath = path.join(process.cwd(), target)
  const srcPath = path.join(__dirname, src)

  if (!fs.existsSync(path.dirname(destPath))) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true })
  }

  fs.copyFileSync(srcPath, destPath)
  console.log(`✅ Created: ${target}`)
})

console.log('\n📦 Installing Prettier...')

try {
  execSync('npm install --save-dev prettier', { stdio: 'inherit' })
  console.log('\n🎉 Prettier installed successfully!\n')
} catch (err) {
  console.error('❌ Failed to install Prettier. Please run manually: npm install --save-dev prettier')
}
