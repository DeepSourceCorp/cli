import { createInstance, INDEXEDDB, clear } from 'localforage'
import { Context, Inject } from '@nuxt/types/app'

export enum DBStores {
  REPOSITORIES = 'repositories',
  RUNS = 'runs',
  CACHE_KEYS = 'cacheKeys'
}

export type GetDB = (dbName: string) => Record<DBStores, LocalForage>
export type ResetLocalDB = () => Promise<void>

declare module 'vue/types/vue' {
  interface Vue {
    $getDB: GetDB
    $resetLocalDB: ResetLocalDB
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $getDB: GetDB
    $resetLocalDB: ResetLocalDB
  }
  interface Context {
    $getDB: GetDB
    $resetLocalDB: ResetLocalDB
  }
}

declare module 'vuex/types/index' {
  // skipcq: JS-0387, JS-0356
  interface Store<S> {
    $getDB: GetDB
    $resetLocalDB: ResetLocalDB
  }
}

const baseOptions: LocalForageOptions = {
  version: 1.0,
  driver: INDEXEDDB,
  description: 'Store repos and runs'
}

/**
 * Bootstrap the db for the current owner and return it
 *
 * @param {string} name - name of the DB
 * @return {Record<string, LocalForage>}
 */
export function getDB(name: string): Record<string, LocalForage> {
  const dbInstance: Record<string, LocalForage> = {}

  // bootstrap a DB for the give owner
  Object.values(DBStores).forEach((storeName) => {
    dbInstance[storeName] = createInstance({
      name,
      storeName,
      ...baseOptions
    })
  })

  return dbInstance
}

/**
 * Reset local DB
 *
 * @return {Promise<void>}
 */
export async function resetLocalDB(): Promise<void> {
  try {
    await clear()
  } catch {
    console.error('Unable to clear local DB')
  }
}

export default (_context: Context, inject: Inject): void => {
  inject('getDB', getDB)
  inject('resetLocalDB', resetLocalDB)
}
