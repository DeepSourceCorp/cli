import { Inject, Context } from '@nuxt/types/app'

declare module 'vue/types/vue' {
  interface Vue {
    $rudderTrack: (candidate: string) => string
  }
}

declare global {
  interface Window {
    rudderanalytics: {
      track: (event: string, data: Record<string, unknown>) => void
    }
    baseTrackingInfo: Record<string, unknown>
  }
}

export default (context: Context, inject: Inject): void => {
  inject(
    'rudderTrack', (event: string, data: Record<string, unknown>) => {
      try {
        if (window.rudderanalytics) {
          window.rudderanalytics.track(event, {
            ...window.baseTrackingInfo,
            ...data
          })
        }
      } catch (err) {
        // do nothing
      }
    }
  )
}
