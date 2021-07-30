/*
Auth Middleware

This middleware will refresh the token in case the user is not logged in
Setting meta strict to true will redirect the user to the login page.
This can be used for sensitive pages like team members, settings, etc.

Decorator Usage:

@Component({
  middleware: ['auth'],
  meta: {
    auth: { strict: false }
  }
})
*/

import { Middleware } from '@nuxt/types'
import { AuthActionTypes, AuthGetterTypes } from '~/store/account/auth'
import { ContextActionTypes } from '~/store/account/context'
import { ActiveUserActions } from '~/store/user/active'

const passList = ['github', 'bitbucket', 'gitlab']

const authMiddleware: Middleware = async ({ app, store, route, redirect, error }) => {
  let strict = false
  let redirectToLogin = false

  app.$cookies.set('bifrost', 1)

  if (route.name && passList.includes(route.name)) {
    return
  }
  const now = (new Date().getTime() + 30_000) / 1000
  const expiry = store.getters[`account/auth/${AuthGetterTypes.EXPIRY}`]
  if (now > expiry) {
    const authPolicy: boolean[] = []
    const redirectToLoginPolicy: boolean[] = []

    route.meta.forEach((meta: { auth: { strict?: boolean; redirectToLogin?: boolean } }) => {
      if (meta.auth && typeof meta.auth.strict !== undefined) {
        authPolicy.push(Boolean(meta.auth.strict))
      }
      if (meta.auth && typeof meta.auth.redirectToLogin !== undefined) {
        redirectToLoginPolicy.push(Boolean(meta.auth.redirectToLogin))
      }
    })

    strict = authPolicy.indexOf(true) > -1 ? true : false
    redirectToLogin = redirectToLoginPolicy.indexOf(true) > -1 ? true : false
    try {
      await store.dispatch(`account/auth/${AuthActionTypes.REFRESH}`)
      store.dispatch(`account/context/${ContextActionTypes.FETCH_CONTEXT}`)
      store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)
    } catch (e) {
      if (strict) {
        if (redirectToLogin) {
          if (route.path !== '/') {
            redirect(302, `/login?next=${route.path}`)
          } else {
            redirect(302, '/login')
          }
        } else {
          error({ statusCode: 404, message: 'This page is not real' })
        }
      }
    }
  }
}

export default authMiddleware
