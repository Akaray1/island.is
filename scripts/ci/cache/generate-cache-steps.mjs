/**
 * This script is used to generate a cache workflow for a CI/CD pipeline.
 */

// @ts-check
import { ENV_KEYS, ENV_YAML_FILE } from './_const.mjs'
import { caches } from './__config.mjs'
import { generateCacheAction, createOutputs, createRuns, exportToYaml } from './generateCacheAction.mjs'

if (!process.env[ENV_KEYS]) {
  throw new Error(`Keys not set`)
}

const steps = await Promise.all(
  caches
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
    .filter((e) => e != null),
)

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


