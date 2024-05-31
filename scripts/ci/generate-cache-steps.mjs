// @ts-check
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { ROOT } from './_common.mjs'

if (!process.env.keys) {
    throw new Error(`Keys not set`);
}
const enableNodeModules = process.env.ENABLE_NODE_MODULES === 'true'
const enableMobileNodeModules =
    process.env.ENABLE_MOBILE_NODE_MODULES === 'true'
const enableGeneratedFiles = process.env.ENABLE_GENERATED_FILES === 'true'
const enableCypress = process.env.ENABLE_CYPRESS === 'true'
const cypressPath = process.env.CYPRESS_PATH
const keys = JSON.parse(process.env.keys)
console.log(keys);
const YAML_FILE = process.env['YAML_FILE']

const steps = [
    enableNodeModules
        ? generateCacheAction(
            'Cache node_modules',
            'node-modules',
            'node_modules',
            keys['node-modules-key'],
        )
        : null,
    enableMobileNodeModules
        ? generateCacheAction(
            'Cache Mobile node_modules',
            'mobile-node-modules',
            'apps/native/app/node_modules',
            keys['mobile-node-modules-key'],
        )
        : null,
    enableGeneratedFiles
        ? generateCacheAction(
            'Cache Generated Files',
            'generated-files',
            'generated_files.tar.gz',
            keys['generated-files-key'],
        )
        : null,
    enableCypress && cypressPath
        ? generateCacheAction(
            'Cache Cypress',
            'cypress-cache',
            cypressPath,
            keys['cypress-cache-modules-key'],
        )
        : null,
].filter((e) => e != null)

const workflow = {
    ...createHeader('Autogenerated cache workflow', 'Autogenerated'),
    ...createOutputs(steps),
    ...createRuns(steps),
}

console.log(JSON.stringify(workflow, null, 2))

if (YAML_FILE) {
    await exportToYaml(workflow, YAML_FILE)
}

function createHeader(name, description) {
    return {
        name,
        description,
    }
}

function createOutputs(steps) {
    return {
        outputs: steps.reduce((a, value) => {
            return {
                ...a,
                [`${value.id}-success`]: {
                    description: `Success for ${value.name}`,
                    value: `\${{ steps.${value.id}.outputs.success }}`,
                },
            }
        }, {}),
    }
}

/**
 * Creates a composite run object with the given steps.
 *
 * @param {Array<Object>} steps - An array of step objects.
 * @returns {Object} - The composite run object.
 */
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
                        key: withValue.key
                    },
                }
            }),
        },
    }
}

/**
 * Generates a cache action object.
 *
 * @param {string} name - The name of the cache action.
 * @param {string} id - The ID of the cache action.
 * @param {string} path - The path to cache.
 * @param {string} key - The cache key.
 * @returns {object} - The cache action object.
 */
function generateCacheAction(name, id, path, key) {
    return {
        name,
        id,
        uses: './.github/actions/cache',
        continue_on_error: true,
        with: {
            path,
            key,
        },
    }
}

/**
 * Export the given object to a YAML file.
 * @param {Object} obj - The object to export.
 * @param {string} _fileName - The file name (relative to the ROOT directory).
 * @param {string} [fileName] - The resolved file name.
 * @returns {Promise<void>} - A promise that resolves when the export is complete.
 */
async function exportToYaml(obj, _fileName, fileName = resolve(ROOT, _fileName)) {
    const YAML_FILE_ROOT = dirname(fileName);
    await mkdir(YAML_FILE_ROOT, { recursive: true });
    return /** @type {Promise<void>} */(new Promise((resolve) => {
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
    }))
}
