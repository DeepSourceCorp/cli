import type { DirectiveOptions } from 'vue'
import type { DirectiveBinding } from 'vue/types/options'

const debounceDirective: DirectiveOptions = {
  bind(el: HTMLElement, binding: DirectiveBinding) {
    // binding.value is optional on binding
    // This check will ensure type sanity on `fn` declaration
    if (!binding.value) return

    // Consumed as `v-debounce:300="updateDebounce"`
    const fn = binding.value as (value: unknown, event: Event) => void

    // This will be used to reset timeout later
    // Always keep this outside of the `oninput` function scope
    let timeoutID: ReturnType<typeof setTimeout>

    const delay = binding.arg ? Number(binding.arg) : 400

    el.oninput = (event: Event) => {
      clearTimeout(timeoutID)
      timeoutID = setTimeout(() => {
        const target = event.target as HTMLInputElement
        // Trigger the binding function
        fn(target.value, event)
      }, delay)
    }
  }
}

export default debounceDirective
