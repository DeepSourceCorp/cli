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

export default ({ $config, $sentry, app }: Context, inject: Inject): void => {
  /**
   * Log error to reporting service and show a toast to the user
   *
   * @param {Error} error
   * @param {string} toastMessage
   *
   * @return {void}
   */
  const logErrorAndToast: LogErrorAndToastT = function (error: Error, toastMessage?: string): void {
    // ?Integrate error reporting tool here

    if (!$config.onPrem) {
      $sentry?.captureException(error)
    }

    if (process.client && toastMessage) {
      app.$toast.danger(toastMessage)
    }
  }

  inject('logErrorAndToast', logErrorAndToast)
}
