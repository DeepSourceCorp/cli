import { createInstance, INDEXEDDB } from 'localforage'
import { Context, Inject } from '@nuxt/types/app'

export enum DBStores {
  REPOSITORIES = 'repositories',
  RUNS = 'runs',
  CACHE_KEYS = 'cacheKeys'
}

export type GetDB = (dbName: string) => Record<DBStores, LocalForage>

declare module 'vue/types/vue' {
  interface Vue {
    $getDB: GetDB
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $getDB: GetDB
  }
  interface Context {
    $getDB: GetDB
  }
}

declare module 'vuex/types/index' {
  // skipcq: JS-0387, JS-0356
  interface Store<S> {
    $getDB: GetDB
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

export default (_context: Context, inject: Inject): void => {
  inject('getDB', getDB)
}
