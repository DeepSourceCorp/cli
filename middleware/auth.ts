import { Middleware } from '@nuxt/types'
import { AuthActionTypes, AuthGetterTypes } from '~/store/auth';


const authMiddleware: Middleware = (context) => {
  context.store.dispatch(`auth/${AuthActionTypes.LOGIN}`);
  if (!context.store.getters[`auth/${AuthGetterTypes.IS_LOGGED_IN}`]) {
    context.redirect(302, '/login')
  }
}

export default authMiddleware
