import { Middleware } from '@nuxt/types'
import {namespace} from 'nuxt-property-decorator'


const myMiddleware: Middleware = (context) => {
  console.log(context.store.getters['auth/token'])
  console.log(context.app.$cookies.get('fuck'))
  context.redirect(301, 'http://googel.com')

}

export default myMiddleware
