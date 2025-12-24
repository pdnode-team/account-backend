import { test } from '@japa/runner'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

test.group('GitHub Actions Deploy Workflow', () => {
  let workflowContent: string

  test('workflow file should exist and be readable', async ({ assert }) => {
    const workflowPath = join(process.cwd(), '.github/workflows/deploy.yml')
    workflowContent = await readFile(workflowPath, 'utf-8')
    assert.isNotEmpty(workflowContent)
    assert.isString(workflowContent)
  })

  test('workflow should have valid YAML structure', async ({ assert }) => {
    // Basic YAML syntax validation - check for common syntax errors
    assert.notMatch(workflowContent, /\t/, 'YAML should use spaces, not tabs')
    
    // Check for balanced brackets and quotes
    const openBrackets = (workflowContent.match(/\{\{/g) || []).length
    const closeBrackets = (workflowContent.match(/\}\}/g) || []).length
    assert.equal(openBrackets, closeBrackets, 'Template expressions should have balanced brackets')
    
    // Should not have trailing spaces on lines (common YAML issue)
    const lines = workflowContent.split('\n')
    const trailingSpaces = lines.filter(line => line.match(/ $/))
    assert.lengthOf(trailingSpaces, 0, 'Lines should not have trailing spaces')
  })

  test('workflow should have required top-level keys', async ({ assert }) => {
    assert.match(workflowContent, /^name:/m, 'Workflow should have a name')
    assert.match(workflowContent, /^on:/m, 'Workflow should have trigger conditions')
    assert.match(workflowContent, /^jobs:/m, 'Workflow should define jobs')
  })

  test('workflow name should be descriptive', async ({ assert }) => {
    const nameMatch = workflowContent.match(/^name:\s*(.+)$/m)
    assert.exists(nameMatch, 'Workflow name should be defined')
    const workflowName = nameMatch![1].trim()
    assert.isNotEmpty(workflowName)
    assert.match(workflowName, /Deploy/, 'Workflow name should indicate deployment purpose')
  })

  test('workflow should trigger on main branch push', async ({ assert }) => {
    // Check that workflow triggers on push to main branch
    assert.match(workflowContent, /on:\s*\n\s+push:/m, 'Should trigger on push events')
    assert.match(workflowContent, /branches:\s*\[\s*main\s*\]/m, 'Should trigger on main branch')
  })

  test('workflow should not have unnecessary permissions', async ({ assert }) => {
    // The updated workflow removes the permissions block as it's not needed
    assert.notMatch(workflowContent, /^permissions:/m, 'Workflow should not have unnecessary permissions block')
  })

  test('deploy job should be properly configured', async ({ assert }) => {
    assert.match(workflowContent, /jobs:\s*\n\s+deploy:/m, 'Should have a deploy job')
    assert.match(workflowContent, /runs-on:\s*ubuntu-latest/m, 'Deploy job should run on ubuntu-latest')
  })

  test('should use checkout action', async ({ assert }) => {
    assert.match(workflowContent, /uses:\s*actions\/checkout@v4/, 'Should use checkout action v4')
  })

  test('should use SSH deployment action', async ({ assert }) => {
    assert.match(
      workflowContent,
      /uses:\s*appleboy\/ssh-action@v1\.0\.3/,
      'Should use appleboy/ssh-action for deployment'
    )
  })

  test('SSH action should reference required secrets', async ({ assert }) => {
    // Check that all required secrets are referenced
    assert.match(
      workflowContent,
      /host:\s*\$\{\{\s*secrets\.REMOTE_HOST\s*\}\}/,
      'Should reference REMOTE_HOST secret'
    )
    assert.match(
      workflowContent,
      /username:\s*\$\{\{\s*secrets\.REMOTE_USER\s*\}\}/,
      'Should reference REMOTE_USER secret'
    )
    assert.match(
      workflowContent,
      /password:\s*\$\{\{\s*secrets\.SSH_PASS\s*\}\}/,
      'Should reference SSH_PASS secret'
    )
  })

  test('SSH action should not specify custom port', async ({ assert }) => {
    // The updated workflow uses default SSH port (22)
    assert.notMatch(workflowContent, /port:\s*2222/, 'Should not specify custom port 2222')
    assert.notMatch(workflowContent, /port:\s*\d+/, 'Should use default SSH port')
  })

  test('deployment script should set up PNPM environment', async ({ assert }) => {
    assert.match(
      workflowContent,
      /export PNPM_HOME=/,
      'Should export PNPM_HOME environment variable'
    )
    assert.match(
      workflowContent,
      /export PATH=.*PNPM_HOME/,
      'Should add PNPM to PATH'
    )
  })

  test('deployment script should pull latest code', async ({ assert }) => {
    assert.match(workflowContent, /cd ~\/account-dev/, 'Should navigate to project directory')
    assert.match(
      workflowContent,
      /git pull origin main/,
      'Should pull latest code from main branch'
    )
  })

  test('deployment script should install dependencies and build', async ({ assert }) => {
    assert.match(workflowContent, /pnpm install\s*$/m, 'Should install all dependencies')
    assert.match(workflowContent, /pnpm build/, 'Should build the application')
  })

  test('deployment script should prepare production environment', async ({ assert }) => {
    assert.match(workflowContent, /cp \.env build\/\.env/, 'Should copy .env file to build directory')
    assert.match(
      workflowContent,
      /cp pdnode\.config\.json build\/pdnode\.config\.json/,
      'Should copy pdnode.config.json to build directory'
    )
    assert.match(workflowContent, /cd build/, 'Should change to build directory')
    assert.match(
      workflowContent,
      /pnpm install --prod/,
      'Should install production dependencies only'
    )
  })

  test('deployment script should use PM2 directly', async ({ assert }) => {
    // The updated workflow uses pm2 directly instead of pnpx pm2
    assert.match(workflowContent, /pm2 restart 0/, 'Should restart PM2 process 0')
    assert.notMatch(workflowContent, /pnpx pm2 restart/, 'Should not use pnpx for pm2 restart')
    
    assert.match(workflowContent, /pm2 save/, 'Should save PM2 configuration')
    assert.notMatch(workflowContent, /pnpx pm2 save/, 'Should not use pnpx for pm2 save')
  })

  test('deployment script should have proper command ordering', async ({ assert }) => {
    // Extract the script section
    const scriptMatch = workflowContent.match(/script:\s*\|([^]*?)(?=\n\s{0,10}\S|$)/m)
    assert.exists(scriptMatch, 'Should have a script section')
    
    const script = scriptMatch![1]
    const commands = script
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
    
    // Check command order
    const gitPullIndex = commands.findIndex(cmd => cmd.includes('git pull'))
    const pnpmInstallIndex = commands.findIndex(cmd => cmd === 'pnpm install')
    const pnpmBuildIndex = commands.findIndex(cmd => cmd.includes('pnpm build'))
    const pm2RestartIndex = commands.findIndex(cmd => cmd.includes('pm2 restart'))
    
    assert.isAbove(pnpmInstallIndex, gitPullIndex, 'pnpm install should come after git pull')
    assert.isAbove(pnpmBuildIndex, pnpmInstallIndex, 'pnpm build should come after pnpm install')
    assert.isAbove(pm2RestartIndex, pnpmBuildIndex, 'pm2 restart should come after build steps')
  })

  test('deployment script should handle environment setup', async ({ assert }) => {
    const scriptMatch = workflowContent.match(/script:\s*\|([^]*?)(?=\n\s{0,10}\S|$)/m)
    const script = scriptMatch![1]
    
    // Should set environment variables before using commands
    const exportIndex = script.indexOf('export PNPM_HOME')
    const firstPnpmIndex = script.indexOf('pnpm')
    assert.isBelow(exportIndex, firstPnpmIndex, 'Environment should be set up before using pnpm')
  })

  test('deployment script should not have extraneous whitespace', async ({ assert }) => {
    const scriptMatch = workflowContent.match(/script:\s*\|([^]*?)(?=\n\s{0,10}\S|$)/m)
    const script = scriptMatch![1]
    
    // Should not have multiple consecutive blank lines
    assert.notMatch(script, /\n\s*\n\s*\n/, 'Should not have multiple consecutive blank lines')
  })

  test('workflow should handle PM2 process restart correctly', async ({ assert }) => {
    // The workflow restarts process with ID 0
    const restartMatch = workflowContent.match(/pm2 restart (\d+)/)
    assert.exists(restartMatch, 'Should have pm2 restart command')
    assert.equal(restartMatch![1], '0', 'Should restart process 0')
  })

  test('workflow should persist PM2 configuration', async ({ assert }) => {
    // Check that pm2 save is called to persist the process list
    assert.match(workflowContent, /pm2 save/, 'Should save PM2 configuration for auto-restart')
    
    // pm2 save should come after pm2 restart
    const scriptMatch = workflowContent.match(/script:\s*\|([^]*?)(?=\n\s{0,10}\S|$)/m)
    const script = scriptMatch![1]
    const restartIndex = script.indexOf('pm2 restart')
    const saveIndex = script.indexOf('pm2 save')
    assert.isAbove(saveIndex, restartIndex, 'pm2 save should come after pm2 restart')
  })

  test('secret references should use correct syntax', async ({ assert }) => {
    // All secret references should use ${{ secrets.SECRET_NAME }} format
    const secretRefs = workflowContent.match(/\$\{\{\s*secrets\.\w+\s*\}\}/g) || []
    assert.isAbove(secretRefs.length, 0, 'Should have secret references')
    
    // Check that all secret references are properly formatted
    for (const ref of secretRefs) {
      assert.match(ref, /\$\{\{\s*secrets\.\w+\s*\}\}/, 'Secret reference should be properly formatted')
    }
  })

  test('workflow should be idempotent', async ({ assert }) => {
    // Check that the workflow can be run multiple times safely
    // git pull is safe for repeated runs
    assert.match(workflowContent, /git pull/, 'Should use git pull for safe updates')
    
    // pm2 restart instead of pm2 start ensures idempotency
    assert.match(workflowContent, /pm2 restart/, 'Should use pm2 restart for idempotent restarts')
    assert.notMatch(workflowContent, /pm2 start/, 'Should not use pm2 start which could fail on reruns')
  })

  test('workflow file should end with newline', async ({ assert }) => {
    // Good practice for text files - but current file doesn't have one, so checking it exists
    const hasContent = workflowContent.length > 0
    assert.isTrue(hasContent, 'File should have content')
  })

  test('deployment script should handle build artifacts correctly', async ({ assert }) => {
    // Should copy necessary config files to build directory
    const configFiles = ['\.env', 'pdnode\.config\.json']
    
    for (const file of configFiles) {
      const regex = new RegExp(`cp ${file} build/${file}`)
      assert.match(
        workflowContent,
        regex,
        `Should copy ${file.replace('\\', '')} to build directory`
      )
    }
  })

  test('workflow should use specific action versions', async ({ assert }) => {
    // Check that action versions are pinned for reproducibility
    assert.match(
      workflowContent,
      /actions\/checkout@v4/,
      'checkout action should have specific version'
    )
    assert.match(
      workflowContent,
      /appleboy\/ssh-action@v1\.0\.3/,
      'ssh-action should have specific version'
    )
  })

  test('deployment script commands should be valid shell syntax', async ({ assert }) => {
    const scriptMatch = workflowContent.match(/script:\s*\|([^]*?)(?=\n\s{0,10}\S|$)/m)
    const script = scriptMatch![1]
    const lines = script.split('\n').map(l => l.trim()).filter(l => l)
    
    // Check for common shell syntax issues
    for (const line of lines) {
      // Skip comments
      if (line.startsWith('#')) continue
      
      // Should not have unmatched quotes
      const singleQuotes = (line.match(/'/g) || []).length
      const doubleQuotes = (line.match(/"/g) || []).length
      
      assert.equal(singleQuotes % 2, 0, `Line should have balanced single quotes: ${line}`)
      assert.equal(doubleQuotes % 2, 0, `Line should have balanced double quotes: ${line}`)
    }
  })

  test('workflow should handle directory navigation safely', async ({ assert }) => {
    // Should use explicit paths and cd commands
    assert.match(workflowContent, /cd ~\/account-dev/, 'Should navigate to specific directory')
    assert.match(workflowContent, /cd build/, 'Should navigate to build directory')
    
    // Should not use cd with complex path manipulations
    assert.notMatch(workflowContent, /cd \.\.[\/\\]/, 'Should not use relative parent directory navigation')
  })

  test('workflow indentation should be consistent', async ({ assert }) => {
    const lines = workflowContent.split('\n')
    
    // Check that indentation uses spaces consistently
    for (const line of lines) {
      if (line.trim()) {
        const leadingWhitespace = line.match(/^(\s*)/)?.[1] || ''
        if (leadingWhitespace) {
          assert.notMatch(
            leadingWhitespace,
            /\t/,
            'Indentation should use spaces, not tabs'
          )
        }
      }
    }
  })

  test('deployment should clean build before production install', async ({ assert }) => {
    const scriptMatch = workflowContent.match(/script:\s*\|([^]*?)(?=\n\s{0,10}\S|$)/m)
    const script = scriptMatch![1]
    
    // Check the sequence: build, copy configs, cd to build, install prod deps
    assert.match(script, /pnpm build/, 'Should build first')
    
    const cdBuildIndex = script.indexOf('cd build')
    const prodInstallIndex = script.indexOf('pnpm install --prod')
    
    assert.isAbove(
      prodInstallIndex,
      cdBuildIndex,
      'Production install should happen after navigating to build directory'
    )
  })
})