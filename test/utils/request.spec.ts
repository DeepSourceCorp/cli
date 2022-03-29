import { NuxtAppOptions } from '@nuxt/types'
import { resolve } from '@sentry/utils'
import { NuxtCookies } from 'cookie-universal-nuxt'
import {
  getCsrfPath,
  getCSRFToken,
  getHttpUri,
  parseCookieString,
  safeCookieAppend,
  selectUriBasedOnEnv
} from '~/utils/request'

describe('[[ Test parseCookieString ]]', () => {
  it('Accepts valid input', () => {
    expect(parseCookieString(`bifrost=1;testing=helloworld;hki=1`)).toMatchObject({
      bifrost: '1',
      testing: 'helloworld',
      hki: '1'
    })
  })
})

describe('[[ Test safeCookieAppend ]]', () => {
  it('Accepts valid input', () => {
    expect(
      parseCookieString(safeCookieAppend(`bifrost=1;testing=helloworld`, `hki=1`))
    ).toMatchObject({
      bifrost: '1',
      testing: 'helloworld',
      hki: '1'
    })
    expect(
      parseCookieString(safeCookieAppend(``, `hki=1;bifrost=1;testing=helloworld`))
    ).toMatchObject({
      bifrost: '1',
      testing: 'helloworld',
      hki: '1'
    })
  })
})

describe('[[ Test selectUriBasedOnEnv ]]', () => {
  const OLD_ENV = process.env
  const isServer = process.server
  const isClient = process.client

  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
    process.env = { ...OLD_ENV } // Make a copy
    process.server = isServer
    process.client = isClient
  })

  it('Toggles on dev', () => {
    process.env.NODE_ENV = 'development'
    expect(selectUriBasedOnEnv('server', 'client', 'dev')).toBe('dev')
    expect(getHttpUri({ apolloServerUri: 'server', apolloClientUri: 'client' })).toBe(
      'http://localhost:8000/graphql/'
    )
    expect(getCsrfPath({ csrfServerUri: 'server', csrfClientUri: 'client' })).toBe(
      'http://localhost:8000/api/set-csrf-cookie/'
    )
  })
  it('Toggles on client', () => {
    process.client = true
    process.server = false
    expect(selectUriBasedOnEnv('server', 'client', 'dev')).toBe('client')
    expect(getHttpUri({ apolloServerUri: 'server', apolloClientUri: 'client' })).toBe('client')
    expect(getCsrfPath({ csrfServerUri: 'server', csrfClientUri: 'client' })).toBe('client')
  })
  it('Toggles on server', () => {
    process.client = false
    process.server = true
    expect(selectUriBasedOnEnv('server', 'client', 'dev')).toBe('server')
    expect(getHttpUri({ apolloServerUri: 'server', apolloClientUri: 'client' })).toBe('server')
    expect(getCsrfPath({ csrfServerUri: 'server', csrfClientUri: 'client' })).toBe('server')
  })
  it('Errors on all false', () => {
    process.env.NODE_ENV = 'test'
    process.client = false
    process.server = false
    expect(() => selectUriBasedOnEnv('server', 'client', 'dev')).toThrowError()
    expect(() =>
      getHttpUri({ apolloServerUri: 'server', apolloClientUri: 'client' })
    ).toThrowError()
    expect(() => getCsrfPath({ csrfServerUri: 'server', csrfClientUri: 'client' })).toThrowError()
  })
})

describe('[[ Test getCSRFToken ]]', () => {
  beforeEach(() => {
    jest.resetModules() // Most important - it clears the cache
  })

  it('returns token from cookie on client', async () => {
    // Meditations, Marcus Aurelius
    const token = 'it-is-in-your-power-to-withdraw-yourself-whenever-you-desire'
    process.server = false

    const mockCookie = {
      set() {},
      setAll() {},
      get(name = '') {
        if (name === 'csrftoken') {
          return token
        }
      },
      getAll() {},
      remove() {},
      removeAll() {}
    } as NuxtCookies

    // @ts-ignore
    const recievedToken = await getCSRFToken({
      $cookies: mockCookie,
      $config: { csrfServerUri: 'mock-uri', csrfClientUri: 'mock-uri' }
    } as NuxtAppOptions)

    expect(recievedToken).toBe(token)
  })

  it('returns token from cookie on client after fetch', async () => {
    // Meditations, Marcus Aurelius
    const token = 'it-is-in-your-power-to-withdraw-yourself-whenever-you-desire'
    let tokenProxy = ''
    process.server = false
    process.client = true

    global.fetch = jest.fn(() => {
      return new Promise((resolve) => {
        tokenProxy = token

        // @ts-ignore
        resolve(true)
      })
    })

    const mockCookie = {
      set() {},
      setAll() {},
      get(name = '') {
        if (name === 'csrftoken') {
          return tokenProxy
        }
      },
      getAll() {},
      remove() {},
      removeAll() {}
    } as NuxtCookies

    // @ts-ignore
    const recievedToken = await getCSRFToken({
      $cookies: mockCookie,
      $config: { csrfServerUri: 'mock-uri', csrfClientUri: 'mock-uri' }
    } as NuxtAppOptions)

    expect(recievedToken).toBe(token)
  })

  it('returns token from cookie on server', async () => {
    // Meditations, Marcus Aurelius
    const token = 'it-is-in-your-power-to-withdraw-yourself-whenever-you-desire'

    process.server = true
    process.client = false

    global.fetch = jest.fn(() => {
      return new Promise((resolve) => {
        resolve({
          // @ts-ignore
          headers: {
            get(name: string) {
              if (name === 'set-cookie') return `csrftoken=${token};hki=1`
              return ''
            }
          }
        })
      })
    })

    const mockCookie = {
      set() {},
      setAll() {},
      get(_) {
        return 'this-is-not-what-you-re-looking-for'
      },
      getAll() {},
      remove() {},
      removeAll() {}
    } as NuxtCookies

    // @ts-ignore
    const recievedToken = await getCSRFToken({
      $cookies: mockCookie,
      $config: { csrfServerUri: 'mock-uri', csrfClientUri: 'mock-uri' }
    } as NuxtAppOptions)

    expect(recievedToken).toBe(token)
  })
})
