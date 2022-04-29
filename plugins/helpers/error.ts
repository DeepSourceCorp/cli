import { Inject, Context } from '@nuxt/types/app'
import { User } from '~/types/types'

export type logErrorAndToast = (
  error: Error,
  toastMessage?: string,
  viewer?: User,
  metadata?: {
    context: string
    params: Record<string, unknown>
  }
) => void

declare module 'vue/types/vue' {
  interface Vue {
    $logErrorAndToast: logErrorAndToast
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $logErrorAndToast: logErrorAndToast
  }
  interface Context {
    $logErrorAndToast: logErrorAndToast
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $logErrorAndToast: logErrorAndToast
  }
}

export default ({ $config, $bugsnag, $toast }: Context, inject: Inject): void => {
  /**
   * Log error to reporting service and show a toast to the user
   *
   * @param {Error} error
   * @param {string} toastMessage
   * @param {User} viewer
   * @param {Object} metadata
   *
   * @return {void}
   */
  const logErrorAndToast: logErrorAndToast = function (error, toastMessage, viewer, metadata) {
    const { context, params } = metadata ?? { context: null, params: null }

    if (!$config.onPrem && $bugsnag) {
      $bugsnag.notify(error, (event) => {
        event.context = context ?? toastMessage
        if (viewer) event.setUser(viewer.id, viewer.email, viewer.firstName)
        if (params) event.addMetadata('errorParams', params)
      })
    }
    if (!process.server && toastMessage) {
      $toast.danger(toastMessage)
    }
  }

  inject('logErrorAndToast', logErrorAndToast)
}
