/**
 * This script is used to generate a cache workflow for a CI/CD pipeline.
 */

// @ts-check
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { ROOT } from './_common.mjs'
import { ENV_KEYS, ENV_YAML_FILE } from './_const.mjs'
import { caches } from './config.mjs'

if (!process.env[ENV_KEYS]) {
  throw new Error(`Keys not set`)
}

const steps = await Promise.all(caches
  .map(async (value) => {
    if (!value.enabled) {
      return null
    }
    return generateCacheAction({
      name: value.name,
      id: value.id,
      path: value.path,
      key: await value.hash(),
    })
  })
  .filter((e) => e != null))

const workflow = {
  name: 'Autogenerated cache workflow',
  description: 'Autogenerated',
  ...createOutputs(steps),
  ...createRuns(steps),
}

const YAML_FILE = process.env[ENV_YAML_FILE]

if (YAML_FILE) {
  await exportToYaml(workflow, YAML_FILE)
}

function createOutputs(steps) {
  return {
    outputs: steps.reduce(
      (a, value) => {
        return {
          ...a,
          [`${value.id}-success`]: {
            description: `Success for ${value.name}`,
            value: `\${{ steps.${value.id}.outputs.success }}`,
          },
        }
      },
      {
        success: {
          description: 'Success for all caches',
          value: JSON.stringify(
            steps.reduce((a, value) => {
              return {
                ...a,
                [value.id]: `\${{ steps.${value.id}.outputs.success }}`,
              }
            }, {}),
          ),
        },
      },
    ),
  }
}

function createRuns(steps) {
  return {
    runs: {
      using: 'composite',
      steps: steps.map((_value) => {
        const { name, id, uses, with: withValue, value } = _value
        return {
          name,
          id,
          uses,
          ...value,
          with: {
            path: withValue.path,
            key: withValue.key,
          },
        }
      }),
    },
  }
}

function generateCacheAction({ name, id, path, key }) {
  return {
    name,
    id,
    uses: 'island-is/cache@v0.3',
    continue_on_error: true,
    with: {
      path,
      key,
    },
  }
}

async function exportToYaml(
  obj,
  _fileName,
  fileName = resolve(ROOT, _fileName),
) {
  const YAML_FILE_ROOT = dirname(fileName)
  await mkdir(YAML_FILE_ROOT, { recursive: true })
  return /** @type {Promise<void>} */ (
    new Promise((resolve) => {
      const jsonString = JSON.stringify(obj)
      const cueProcess = spawn('cue', ['export', '-', '-o', fileName])
      cueProcess.stdin.write(jsonString)
      cueProcess.on('message', (msg) => {
        console.log(msg)
      })
      cueProcess.on('error', (msg) => {
        console.log(msg)
      })
      cueProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`cue export failed with code ${code}`)
          process.exit(1)
        }
        resolve()
      })
      cueProcess.stdin.end()
    })
  )
}
