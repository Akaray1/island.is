// @ts-check
import { resolve } from 'path'
import { cacheSuccess, caches, initCache } from './__config.mjs'
import { ROOT } from './_common.mjs'
import { ENV_JOB_STATUS, ENV_YAML_FILE } from './_const.mjs'
import {
  createSaveOutputs,
  createRuns,
  generateCacheActionSave,
  exportToYaml,
} from './_generate-cache-steps-utils.mjs'

const YAML_FILE = process.env[ENV_YAML_FILE]
const enabledCaches = caches.filter((value) => value.enabled)
let failedJobs = []
let saveJobs = []

for (const cache of enabledCaches) {
  const fileName = resolve(ROOT, cache.path)
  const isOkay = cache.check
    ? await cache.check(cacheSuccess[cache.id] === 'true', fileName)
    : cacheSuccess[cache.id] === 'true'
  if (!isOkay) {
    if (!initCache) {
      failedJobs = [...failedJobs, cache.name]
    } else if (cache.init) {
      console.log(`Init cache ${cache.name}`)
      const _success = await cache.init()
      const success = await cache.check(_success, fileName)
      if (!success && !failedJobs) {
        failedJobs = [...failedJobs, cache.name]
      } else {
        saveJobs = [...saveJobs, cache]
      }
    }
  }
}
const successJobsEnv = failedJobs.reduce((a, b) => {
  a[b] = false
}, {})
if (saveJobs.length > 0) {
  saveJobs.forEach((value) => {
    successJobsEnv[
      value.name
    ] = `save-\${{ steps.${value.id}.outcome == 'failure' ? false : true }}`
  })
}

/**
 * Array of steps.
 * @type {any[]}
 */
let steps = [
  {
    name: 'Success check',
    id: 'success-check',
    env: {
      [ENV_JOB_STATUS]: JSON.stringify(successJobsEnv),
    },
  },
]

if (initCache) {
  steps = [
    ...await Promise.all(
      saveJobs
        .map(async (value) => {
          if (!value.enabled) {
            return null
          }
          return generateCacheActionSave({
            name: value.name,
            id: value.id,
            path: value.path,
            key: await value.hash(),
          })
        })
        .filter((e) => e != null),
    ),
    ...steps,
  ].flat()
}

const workflow = {
  name: 'Autogenerated save cache workflow',
  description: 'Autogenerated',
  ...createSaveOutputs(),
  ...createRuns(steps),
}

if (YAML_FILE) {
  await exportToYaml(workflow, YAML_FILE)
}
