import Redis, { ClusterNode, RedisOptions, ClusterOptions } from 'ioredis'
import { RedisClusterCache } from 'apollo-server-cache-redis'

import { logger } from '@island.is/logging'

type Options = {
  name: string
  nodes: string[]
  ssl: boolean
  noPrefix?: boolean
}

const DEFAULT_PORT = 6379

class Cache {
  private client: Redis.Cluster

  constructor(client: Redis.Cluster) {
    this.client = client
  }

  get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  set(key: string, value: string): Promise<string | null> {
    return this.client.set(key, value)
  }

  expire(key: string, seconds: number): Promise<Redis.BooleanResponse> {
    return this.client.expire(key, seconds)
  }
}

const parseNodes = (nodes: string[]): ClusterNode[] =>
  nodes
    .filter((url) => url)
    .map((url) => {
      const [host, port] = url.split(':')
      return {
        host,
        port: parseInt(port, 10) || DEFAULT_PORT,
      }
    })

const getRedisClusterOptions = (
  options: Options,
): RedisOptions | ClusterOptions => {
  const redisOptions: RedisOptions = {}
  if (options.ssl) {
    redisOptions['tls'] = {}
  }
  return {
    keyPrefix: options.noPrefix ? undefined : `${options.name}:`,
    slotsRefreshTimeout: 2000,
    slotsRefreshInterval: 10000,
    connectTimeout: 5000,
    // https://www.npmjs.com/package/ioredis#special-note-aws-elasticache-clusters-with-tls
    dnsLookup: (address, callback) => callback(null, address, 0),
    redisOptions,
    reconnectOnError: (err) => {
      logger.error(`Reconnect on error: ${err}`)
      const targetError = 'READONLY'
      if (err.message.slice(0, targetError.length) === targetError) {
        // Only reconnect when the error starts with "READONLY"
        return true
      }
      return false
    },
    retryStrategy: (times) => {
      logger.info(`Redis Retry: ${times}`)
      if (times >= 3) {
        return undefined
      }
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  }
}

export const createCache = (options: Options) =>
  new Cache(createRedisCluster(options))

export const createApolloCache = (options: Options) => {
  const nodes = parseNodes(options.nodes)
  logger.info(`Making caching connection with nodes: `, nodes)
  return new RedisClusterCache(nodes, getRedisClusterOptions(options))
}

export const createRedisCluster = (options: Options) => {
  const nodes = parseNodes(options.nodes)
  logger.info(`Making caching connection with nodes: `, nodes)
  return new Redis.Cluster(nodes, getRedisClusterOptions(options))
}
