/**
 * Web worker to hydrate the indexedDB with the latest information.
 *
 * ## Notes on usage
 *
 * - When a message is passed between the main thread and worker, it is copied, not shared.
 * - Inside the worker, the worker is effectively the global scope. It runs in a totally different thread
 *
 * ## Security
 *
 * - Workers communicate only via the [MessagePort]{@link https://developer.mozilla.org/en-US/docs/Web/API/MessagePort} interaface,
 *   so as long as we don't post sensitive information from the worker to the main thread, we're good
 */

import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'

import { getDB } from '../plugins/helpers/storage.client'
import { getGQLAfter } from '../plugins/helpers/store'
import { resolveNodes } from '~/utils/array'

import ownerCacheKeys from './queries/ownerCacheKeys'
import repoList from './queries/repoList'

// Declare these values at the top levl context to access it across the script
let client = null
let context = null
let db = null

/**
 * Request the cache keys from the server and compare it with local cache keys
 *
 * @param {string} scope - scope of the cache keys
 * @param {string} key - the cache key to compare for
 * @param {oject} variables - owner login and provider details to make queries
 *
 * @return {[isCacheStale, newCacheKey]} Array with a boolean and the cache key from the backend
 */
async function isCacheStale(scope, key, variables) {
  const response = await client.query({ query: ownerCacheKeys, variables, context })
  const cacheKeys = response.data.owner.cacheKeys
  const cacheValue = await db.cacheKeys.getItem(`${scope}::${key}`)

  return [cacheKeys[key] !== cacheValue, cacheKeys[key]]
}

/**
 * Set a new cache key
 *
 * @param {string} scope - scope of the cache keys
 * @param {string} key - the cache key to compare for
 * @param {string} value - the new cache key
 *
 * @return {Promise<void>}
 */
function updateCacheKey(scope, key, value) {
  return db.cacheKeys.setItem(`${scope}::${key}`, value)
}

/**
 * Check for cache validity and request all the repositories and commit it ot the DB
 *
 * @param {any} variables
 * @param {oject} variables - owner login and provider details to make queries
 *
 * @return {void}
 */
async function syncRepoList(variables) {
  let hasNextPage = true
  let loopIndex = 0
  const limit = 100
  const repositories = []

  const [isStale, newCacheKey] = await isCacheStale('owner', 'repositories', variables)

  // if the cache is not stale, return as is
  if (!isStale) {
    return
  }

  // loop untill hasNextPage from the query is false
  while (hasNextPage) {
    // Ignoring DeepSource issue here since the data from the query is
    // required to check if another query has to be made or not
    // skipcq: JS-0032
    const response = await client.query({
      query: repoList,
      variables: {
        ...variables,
        limit,
        after: getGQLAfter(loopIndex, limit)
      },
      context
    })

    repositories.push(...resolveNodes(response.data.owner.repositories))

    // update loop index for the `after` param
    loopIndex = loopIndex + 1

    // update hasNextPage from the query
    hasNextPage = response.data.owner.repositories.pageInfo.hasNextPage

    // break loop after 10 requests, this is just for sanity while we still understand more about our workers
    // TODO: Remove this in the future
    if (loopIndex === 10) {
      break
    }
  }

  // commit the repositories to the indexedDB and update cache keys
  repositories.forEach((repo) => {
    db.repositories.setItem(repo.id, repo)
  })

  await updateCacheKey('owner', 'repositories', newCacheKey)
}

// A job map to ensure we only trigger jobs in the script
const jobMap = {
  syncRepoList
}

self.onmessage = async (payload) => {
  const { taskName, params, appConfig, apolloConfig } = payload.data

  if (!(taskName in jobMap)) {
    // log if worker is not present
    self.postMessage({
      taskName: 'logError',
      payload: {
        error: new Error(`${taskName} not found in worker job list`),
        taskName,
        params
      }
    })
    // skipcq: JS-0002
    console.warn(`${taskName} not found in worker job list`)
    return
  }

  // initiate the client, no caching required
  client = new ApolloClient({
    link: createHttpLink({
      uri: appConfig.apolloClientUri,
      credentials: 'include',
      fetchOptions: {
        mode: 'cors'
      }
    }),
    cache: new InMemoryCache()
  })

  // get the DB for the current owner
  db = getDB(`${params.provider}/${params.login}`)

  // set this for the global scope
  context = apolloConfig

  // get the method and trigger it
  try {
    const method = jobMap[taskName]
    await method(params)
  } catch (e) {
    self.postMessage({
      taskName: 'logError',
      payload: {
        error: e,
        taskName,
        params
      }
    })
  }
}
