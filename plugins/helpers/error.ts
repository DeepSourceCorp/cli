import { Inject, Context } from '@nuxt/types/app'
import { User } from '~/types/types'

export type LogErrorAndToastT = (
  error: Error,
  toastMessage?: `${string}.`,
  viewer?: User,
  metadata?: {
    context: string
    params: Record<string, unknown>
  }
) => void

declare module 'vue/types/vue' {
  interface Vue {
    $logErrorAndToast: LogErrorAndToastT
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $logErrorAndToast: LogErrorAndToastT
  }
  interface Context {
    $logErrorAndToast: LogErrorAndToastT
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $logErrorAndToast: LogErrorAndToastT
  }
}

export default ({ $config, $bugsnag, app }: Context, inject: Inject): void => {
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
  const logErrorAndToast: LogErrorAndToastT = function (error, toastMessage, viewer, metadata) {
    const { context, params } = metadata ?? { context: null, params: null }
    const bugsnag = process.client ? app.$bugsnag : $bugsnag

    if (!$config.onPrem && bugsnag) {
      bugsnag.notify(
        error,
        (event: {
          context: string | undefined
          setUser: (id: string, email: string, firstName: string) => void
          addMetadata: (key: string, values: Record<string, unknown>) => void
        }) => {
          event.context = context ?? toastMessage
          if (viewer) event.setUser(viewer.id, viewer.email, viewer.firstName)
          if (params) event.addMetadata('errorParams', params)
        }
      )
    }
    if (process.client && toastMessage) {
      app.$toast.danger(toastMessage)
    }
  }

  inject('logErrorAndToast', logErrorAndToast)
}
