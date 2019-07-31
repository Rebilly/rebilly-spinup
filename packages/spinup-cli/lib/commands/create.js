const path = require('path')
const fs = require('fs-extra')
const execa = require('execa')
const chalk = require('chalk')
const Tasks = require('@hjvedvik/tasks')
const { hasYarn } = require('../utils')

module.exports = async (template) => {
  const repoName = `spinup-template-${template.toLowerCase()}`
  const dir = aboslutePath(repoName)
  const projectName = path.basename(dir)
  const useYarn = await hasYarn()

  try {
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
    if (files.length > 1) {
      return console.log(chalk.red(`Directory «${projectName}» is not empty.`))
    }
  } catch (err) {
    throw new Error(err.message)
  }

  const templates = ['billing', 'checkout', 'kyc']
  let repo
  if (templates.includes(template)) {
    repo = `https://github.com/Rebilly/${repoName}.git`
  } else {
    repo = template
  }

  const developCommand = 'rebilly-spinup develop'
  const buildCommand = 'rebilly-spinup build'

  const tasks = new Tasks([
    {
      title: `Clone repository, generate the project: ${chalk.green(projectName)}`,
      task: async () => {
        try {
          await exec('git', ['clone', repo, dir, '--single-branch'])
          await fs.remove(path.join(dir, '.git'))
        } catch (err) {
          throw new Error(err.message)
        }
      }
    },
    {
      title: `Install dependencies`,
      task: (_, task) => {
        const command = useYarn ? 'yarn' : 'npm'
        const stdio = ['ignore', 'pipe', 'ignore']
        const options = { cwd: projectDir, stdio }
        const args = []

        if (command === 'npm') {
          task.setStatus('Installing dependencies with npm...')
          args.push('install', '--loglevel', 'error')
        } else if (command === 'yarn') {
          args.push('--json')
        }

        return new Promise((resolve, reject) => {
          const child = exec(command, args, options, projectDir)

          child.stdout.on('data', buffer => {
            let str = buffer.toString().trim()

            if (str && command === 'yarn' && str.indexOf('"type":') !== -1) {
              const newLineIndex = str.lastIndexOf('\n')

              if (newLineIndex !== -1) {
                str = str.substr(newLineIndex)
              }

              try {
                const { type, data } = JSON.parse(str)

                if (type === 'step') {
                  const { message, current, total } = data
                  task.setStatus(`${message} (${current} of ${total})`)
                }
              } catch (e) {}
            } else {
              task.setStatus(`Installing dependencies with ${command}...`)
            }
          })

          child.on('close', code => {
            if (code !== 0) {
              return reject(
                new Error(
                  `Failed to install dependencies with ${command}. ` +
                  `Please enter ${chalk.cyan(repoName)} directory and ` +
                  `install dependencies with yarn or npm manually. ` +
                  `Then run ${chalk.cyan(developCommand)} to start ` +
                  `local development.\n\n    Exit code ${code}`
                )
              )
            }

            resolve()
          })
        })
      }
    }
  ])

  await tasks.run()

  console.log()
  if (process.cwd() !== tmpDir) {
    console.log(`  - Enter directory ${chalk.green(`cd ${repoName}`)}`)
  }
  console.log(`  - Run ${chalk.green(developCommand)} to start local development`)
  console.log(`  - Run ${chalk.green(buildCommand)} to build for production`)
  console.log()
}

function exec (cmd, args = [], options = {}, context = process.cwd()) {
  return execa(cmd, args, {
    stdio: options.stdio || 'ignore',
    cwd: context
  })
}

function aboslutePath (string) {
  if (path.isAbsolute(string)) return string
  return path.join(process.cwd(), string)
}
