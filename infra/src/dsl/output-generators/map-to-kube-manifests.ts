import {
  AccessModes,
  IngressForEnv,
  PostgresInfo,
  PostgresInfoForEnv,
  Resources,
  ServiceDefinition,
  ServiceDefinitionForEnv,
} from '../types/input-types'
import {
  ContainerRunHelm,
  OutputFormat,
  OutputVolumeMountNative,
  SerializeErrors,
  SerializeMethod,
  SerializeSuccess,
  KubeService,
} from '../types/output-types'
import { ReferenceResolver, EnvironmentConfig } from '../types/charts'
import { checksAndValidations } from './errors'
import {
  postgresIdentifier,
  resolveWithMaxLength,
  serializeEnvironmentVariables,
} from './serialization-helpers'

/**
 * Transforms our definition of a service to a Helm values object
 * @param service Our service definition
 * @param deployment Uber chart in a specific environment the service will be part of
 */
const serializeService: SerializeMethod<KubeService> = async (
  service: ServiceDefinitionForEnv,
  deployment: ReferenceResolver,
  opsenv: EnvironmentConfig,
) => {
  const { mergeObjects, getErrors } = checksAndValidations(service.name)
  const serviceDef = service
  const { namespace, securityContext } = serviceDef
  const result: KubeService = {
    metadata: {
      name: service.name,
      namespace: namespace,
    },
    labels: {
      'tags.datadoghq.com/env': opsenv.type,
      'tags.datadoghq.com/service': service.name,
      'tags.datadoghq.com/version': `821090935708.dkr.ecr.eu-west-1.amazonaws.com/${
        service.image ?? service.name
      }`,
    },
    spec: {
      strategy: {
        type: 'RollingUpdate',
        rollingUpdate: {
          maxSurge: '25%',
          maxUnavailable: '25%',
        },
      },
      template: {
        metadata: {
          labels: {
            'tags.datadoghq.com/env': opsenv.type,
            'tags.datadoghq.com/service': service.name,
            'tags.datadoghq.com/version': `821090935708.dkr.ecr.eu-west-1.amazonaws.com/${
              service.image ?? service.name
            }`,
          },
          annotations: {
            [`ad.datadoghq.com/${service.name}.logs`]: `[{
              "log_processing_rules": [{
                "type": "mask_sequences", 
                "name": "mask_national_ids", 
                "replace_placeholder": "--MASKED--", 
                "pattern" : "\\b(?:[89]\\d{3}|(?:[012]\\d|3[01])(?:0\\d|1[012]))\\d\\d-?\\d{4}\\b"
              }]
            }]`,
          },
        },
      },
      spec: {
        containers: {
          name: service.name,
          securityContext: service.securityContext,
          image: `821090935708.dkr.ecr.eu-west-1.amazonaws.com/${
            service.image ?? service.name
          }`,
          imagePullPolicy: 'IfNotPresent',
          livenessProbe: {
            httpGet: {
              path: service.liveness.path,
              port: service.healthPort,
            },
            initialDelaySeconds: service.liveness.initialDelaySeconds,
            timeoutSeconds: service.liveness.timeoutSeconds,
          },
          readinessProbe: {
            httpGet: {
              path: service.readiness.path,
              port: service.healthPort,
            },
            initialDelaySeconds: service.readiness.initialDelaySeconds,
            timeoutSeconds: service.readiness.timeoutSeconds,
          },
          env: {
            SERVERSIDE_FEATURES_ON: opsenv.featuresOn.join(','),
            NODE_OPTIONS: `--max-old-space-size=${
              parseInt(serviceDef.resources.limits.memory, 10) - 48
            }`,
          },
          resources: service.resources,
        },
      },
    },
  }

  // command and args
  if (serviceDef.cmds) {
    result.spec.spec.containers.command = [serviceDef.cmds]
  }
  if (serviceDef.args) {
    result.spec.spec.containers.args = serviceDef.args
  }

  // environment vars
  if (Object.keys(serviceDef.env).length > 0) {
    const { envs } = serializeEnvironmentVariables(
      service,
      deployment,
      serviceDef.env,
      opsenv,
    )
    mergeObjects(
      result.spec.spec.containers.env as { [name: string]: string },
      envs,
    )
  }

  // secrets
  if (Object.keys(serviceDef.secrets).length > 0) {
    Object.entries(serviceDef.secrets).forEach(([key, value]) => {
      result.spec.spec.containers.env = {
        [`${key}`]: {
          valueFrom: {
            secretKeyRef: {
              name: key,
              key: value,
            },
          },
        },
      }
    })
  }

  if (Object.keys(serviceDef.files).length > 0) {
    serviceDef.files.forEach((f) => {
      result.spec.spec.containers.volumeMounts = []
      result.spec.spec.containers.volumeMounts.push({
        name: f.filename,
        mountPath: `/etc/config/${f.filename}`,
      })
    })
  }

  // service account
  if (serviceDef.serviceAccountEnabled) {
    result.spec.spec.containers.securityContext = {
      allowPrivilegeEscalation: false,
      privileged: false,
      fsGroup: 65534,
    }
    const serviceAccountName = serviceDef.accountName ?? serviceDef.name
    result.spec.spec.serviceAccountName = serviceAccountName
  }

  // initContainers
  if (typeof serviceDef.initContainers !== 'undefined') {
    result.spec.spec.initContainers = []
    if (serviceDef.initContainers.containers.length > 0) {
      serviceDef.initContainers.containers.forEach((c) => {
        const legacyCommand = []
        legacyCommand.push(c.command)
        if (result.spec.spec.initContainers) {
          result.spec.spec.initContainers.push({
            args: c.args,
            command: legacyCommand,
            name: c.name,
            image: '',
            env: serviceDef.initContainers?.envs as { [name: string]: string },
          })
        }
      })
    }
  }
  const allErrors = getErrors()
  return allErrors.length === 0
    ? { type: 'success', serviceDef: [result] }
    : { type: 'error', errors: allErrors }
}

export const KubeOutput: OutputFormat<KubeService> = {
  serializeService(
    service: ServiceDefinitionForEnv,
    deployment: ReferenceResolver,
    env: EnvironmentConfig,
  ): Promise<SerializeSuccess<KubeService> | SerializeErrors> {
    return serializeService(service, deployment, env)
  },
  featureDeployment(options): KubeService {
    throw new Error('Not used')
  },
  serviceMockDef(options): KubeService {
    throw new Error('Not used')
  },
}