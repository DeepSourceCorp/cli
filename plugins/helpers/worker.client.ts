/**
 * Plugin loads the workers on the client and exposes the sendWorkerTask method.
 * It also handles the error reporting.
 *
 * See MDN: https://developer.mozilla.org/en-US/docs/Web/API/Worker
 */

import { Inject, NuxtAppOptions } from '@nuxt/types/app'
import { Context } from '@nuxt/types'
import { VcsProviderChoices } from '~/types/types'

const workerStub = {
  postMessage() {}, // skipcq: JS-0321
  addEventListener(_message: unknown, _callback: (message: MessageEvent<any>) => void) {} // skipcq: JS-0321, JS-0323
}

export type WorkerParams = {
  provider: VcsProviderChoices
  login: string
  repo?: string
}

declare module 'vue/types/vue' {
  interface Vue {
    $sendWorkerTask: (taskName: string, params: WorkerParams) => void
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $sendWorkerTask: (taskName: string, params: WorkerParams) => void
  }
  interface Context {
    $sendWorkerTask: (taskName: string, params: WorkerParams) => void
  }
}

declare module 'vuex/types/index' {
  // skipcq: JS-0387, JS-0356
  interface Store<S> {
    $sendWorkerTask: (taskName: string, params: WorkerParams) => void
  }
}

export default (context: Context, inject: Inject) => {
  const worker = window.Worker ? new Worker('/worker/data.worker.js') : workerStub

  /**
   * Wrapper around, [WorkerpostMessage]{@link https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage}.
   * The wrapper extracts information like csrf token, JWT value to use with apollo
   *
   * @param {string} taskName - name of the task to be executed
   * @param {object} params - Parameters to be passed to the worker
   * @param {object} context - The app context to access store and cookies
   */
  function _sendTask(
    taskName: string,
    params: WorkerParams,
    { $config, $cookies, store }: NuxtAppOptions
  ) {
    const csrfToken = $cookies.get('csrftoken')

    const token = store?.getters[`account/auth/getJWT`]
    worker.postMessage({
      taskName,
      params,
      appConfig: $config,
      apolloConfig: {
        headers: {
          'X-CSRFToken': csrfToken,
          Cookie: `csrftoken=${csrfToken}`,
          Authorization: `JWT ${token}`
        }
      }
    })
  }

  // skipcq: JS-0323
  // Event listener to handle errors and report it to the monitoring service
  worker.addEventListener('message', (message: { data: { taskName: string; payload: any } }) => {
    const { taskName, payload } = message.data
    if (taskName === 'logError') {
      context.app.$bugsnag.notify(
        payload.error,
        (event: {
          context: string | undefined
          addMetadata: (key: string, values: Record<string, unknown>) => void
        }) => {
          event.context = `Error in web worker task ${payload.taskName}`
          event.addMetadata('errorParams', payload.params)
        }
      )
    }
  })

  inject('worker', worker)

  inject('sendWorkerTask', function (taskName: string, params: WorkerParams) {
    _sendTask(taskName, params, context.app)
  })
}
