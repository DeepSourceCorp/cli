import Vue from 'vue'
import { Inject, Context } from '@nuxt/types/app'

import { Toast } from '~/components/Toast/index'
import { spawn } from '~/utils/component'

const containerClasses = [
  'z-1000',
  'fixed',
  'inset-0',
  'flex',
  'flex-col',
  'items-end',
  'justify-center',
  'px-4',
  'py-6',
  'pointer-events-none',
  'sm:p-6',
  'sm:items-end',
  'sm:justify-end'
]

declare interface ToastInterface {
  show(props: string | Record<string, unknown>): void
  success(message: string): void
  danger(message: string): void
  info(message: string): void
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $toast: ToastInterface
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $toast: ToastInterface
  }
  interface Context {
    $toast: ToastInterface
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $toast: ToastInterface
  }
}

export default (context: Context, inject: Inject): void => {
  const toasts = document.createElement('div')
  containerClasses.forEach((c) => toasts.classList.add(c))
  toasts.setAttribute('id', 'toasts-wrapper')
  document.body.appendChild(toasts)

  const ToastProgrammatic: ToastInterface = {
    show(props: Record<string, unknown> | string) {
      if (typeof props === 'string') props = { message: props }
      return spawn('toasts-wrapper', props, Toast, Vue)
    },
    success(message: string) {
      return spawn('toasts-wrapper', { type: 'success', message, timeout: 2.5 }, Toast, Vue)
    },
    danger(message: string) {
      return spawn('toasts-wrapper', { type: 'danger', message, timeout: 3 }, Toast, Vue)
    },
    info(message: string) {
      return spawn('toasts-wrapper', { type: 'info', message, timeout: 3 }, Toast, Vue)
    }
  }
  inject('toast', ToastProgrammatic)
}
