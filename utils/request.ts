import { Context, NuxtAppOptions } from '@nuxt/types'
import { Maybe } from '~/types/types'

let localCsrfToken = ''

/**
 * Select the correct URI based on the environment
 *
 * @param {string} server
 * @param {string} client
 * @param {string} dev
 *
 * @return {string}
 */
export function selectUriBasedOnEnv(server: string, client: string, dev: string): string {
  if (process.env.NODE_ENV === 'development') {
    return dev
  }
  if (process.server) return server
  if (process.client) return client
  throw new Error('Both process.server and process.client are false')
}

/**
 * Parse cookie string to an object
 *
 * @param {string} cookieStr
 *
 * @returns Record<string, string>
 */
export function parseCookieString(cookieStr: string): Record<string, string> {
  return cookieStr
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc: Record<string, string>, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim())
      return acc
    }, {})
}

/**
 * Returns Apollo server's url depending upon the environment that Bifrost is running in¸
 *
 * @param  {Context['$config']} config
 *
 * @returns string
 */
export function getHttpUri({ apolloServerUri, apolloClientUri }: Context['$config']): string {
  return selectUriBasedOnEnv(apolloServerUri, apolloClientUri, 'http://localhost:8000/graphql/')
}

/**
 * Returns Asgard csrf url depending upon the environment that Bifrost is running in¸
 *
 * @param  {Context['$config']} config
 *
 * @returns string
 */
export function getCsrfPath({ csrfServerUri, csrfClientUri }: Context['$config']): string {
  return selectUriBasedOnEnv(
    csrfServerUri,
    csrfClientUri,
    'http://localhost:8000/api/set-csrf-cookie/'
  )
}

/**
 * Find the csrf token from the local context or cookies and return it
 * If not found, get the token from server
 *
 * @param {NuxtAppOptions}
 *
 * @return {Promise<string>}
 */
export async function getCSRFToken({ $cookies, $config }: NuxtAppOptions): Promise<string> {
  let csrfToken = process.server ? localCsrfToken : $cookies.get('csrftoken')

  if (!csrfToken) {
    const response = await fetch(getCsrfPath($config), {
      credentials: 'include'
    })

    if (process.client) {
      csrfToken = $cookies.get('csrftoken')
    } else {
      const cookieString = response.headers.get('set-cookie') as string
      csrfToken = parseCookieString(cookieString)['csrftoken']
      localCsrfToken = csrfToken
    }
  }
  return csrfToken
}

/**
 * Append two cookie strings
 *
 * @param {Maybe<string>} appendTo
 * @param {string} candidateToAppend
 *
 * @return {string}
 */
export function safeCookieAppend(appendTo: Maybe<string>, candidateToAppend: string): string {
  return appendTo ? `${appendTo}; ${candidateToAppend}` : candidateToAppend
}
