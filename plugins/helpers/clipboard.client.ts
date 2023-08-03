import { Inject, Context } from '@nuxt/types/app'

declare module 'vue/types/vue' {
  interface Vue {
    $copyToClipboard: (candidate: string) => string
  }
}

// Usage in Vue: <z-button @click="$copyToClipboard('hello, world')">Copy Text</z-button>

/* For FireFox
You may get a warning in firefox

  document.execCommand(‘cut’/‘copy’) was denied because it was not called from inside a short running user-generated event handler.

This arises because, the copy will work only inside a user `click` handler

From MDN: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard#using_execcommand()

> These commands can be used without any special permission if
  you are using them in a short-lived event handler for a user
  action (for example, a click handler).
*/

export default (context: Context, inject: Inject): void => {
  inject('copyToClipboard', async (candidate: string): Promise<void> => {
    try {
      // try the clipboard API
      // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
      // This will fail in Firefox
      await navigator.clipboard.writeText(candidate)
    } catch (e) {
      // fallback for firefox
      // Always run inside click event
      const el = document.createElement('input')
      el.value = candidate
      el.select()
      document.execCommand('copy')
      el.remove()
    }
  })
}
