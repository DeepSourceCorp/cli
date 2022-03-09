import Vue from 'vue'
import { VueConstructor } from 'vue/types'

// add the component w/ the specified props
export function spawn(
  id: string,
  propsData: Record<string, unknown>,
  Component: VueConstructor<Vue>,
  Vue: VueConstructor
) {
  const Instance = Vue.extend(Component)

  if (document) {
    return new Instance({
      el: document.getElementById(id)?.appendChild(document.createElement('div')),
      propsData
    })
  }
}
