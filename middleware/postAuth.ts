import { Middleware } from '@nuxt/types'
import { AuthActionTypes } from '~/store/account/auth'
import { ContextActionTypes, ContextGetterTypes } from '~/store/account/context'
import { ActiveUserActions, ActiveUserGetterTypes } from '~/store/user/active'

const postAuthMiddleware: Middleware = async ({ store, route, redirect }) => {
  const { code, next } = route.query
  let provider = ''

  // todo: move this to another function.
  // The provider value is set as route.meta in nuxt.config.js.  route.meta is always an array.
  if (!route.meta) {
    throw new Error('Something went wrong while logging you in.')
  }
  for (let i = 0; i < route.meta.length; i++) {
    const val = route.meta[i]
    if (val.provider) {
      provider = val.provider
    }
  }

  if (!code) {
    throw new Error('Authorization code missing in redirect.')
  }

  await store.dispatch(`account/auth/${AuthActionTypes.LOG_IN}`, {
    provider,
    code
  })

  await Promise.all([
    store.dispatch(`account/context/${ContextActionTypes.FETCH_CONTEXT}`),
    store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)
  ])

  const toOnboard = store.getters[`account/context/${ContextGetterTypes.TO_ONBOARD}`]
  const homePage = store.getters[`user/active/${ActiveUserGetterTypes.GET_HOME_URL}`]
  const installationUrl = store.getters[`account/context/${ContextGetterTypes.INSTALLATION_URL}`](
    provider
  )

  if (next) {
    redirect(next as string)
    return
  }

  if (!toOnboard) {
    redirect(homePage)
    return
  }

  redirect(installationUrl)
}

export default postAuthMiddleware
