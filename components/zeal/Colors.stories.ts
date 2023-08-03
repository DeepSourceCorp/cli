import '../assets/css/tailwind.css'
import '../assets/css/typography.css'
import '../assets/css/layout.css'

import baseColors from '~/utils/tailwind/colors'

export default {
  title: 'Colors'
}

export const Colors = () => ({
  data() {
    return {
      baseColors
    }
  },
  template: `<div class="p-5">
      <h1 class="mb-5 text-lg font-bold text-vanilla-100">Pallette</h1>
      <div class='grid grid-cols-4 gap-5 mb-12'>
        <template v-for="(color, key) in baseColors">
          <div :key="key" v-if="typeof color !== 'string'">
            <div class="overflow-hidden rounded-lg shadow-lg">
              <template v-for="(shade, name) in color">
                <div
                  v-if="name !== 'DEFAULT'"
                  :key="name"
                  :class="'bg-' + key + '-' + name"
                  class="flex items-center justify-between w-full h-12 px-4 font-semibold"
                >
                  <span>{{ name }}</span>
                  <span class="uppercase">{{ shade }}</span>
                </div>
              </template>
            </div>
            <div class="mt-2 overflow-hidden rounded-lg shadow-lg" v-if="color['DEFAULT']">
                <div
                  :class="'bg-' + key"
                  class="flex items-center justify-between w-full h-12 px-4 font-semibold"
                >
                  <span>Default</span>
                  <span class="uppercase">{{ color['DEFAULT'] }}</span>
                </div>
            </div>
            <h3 class="mt-4 text-base font-bold capitalize text-vanilla-100">{{ key }}</h3>
          </div>
        </template>
      </div>
      <h1 class="mb-5 text-lg font-bold text-vanilla-100">Single Colors</h1>
      <div class='grid grid-cols-8 gap-5 mb-8'>
        <template v-for="(value, key) in baseColors">
          <div :key="key" v-if="typeof value === 'string' && !['transparent', 'current'].includes(key)">
            <div class="w-full rounded-lg h-22" :class="'bg-' + key"></div>
            <h3 class="mt-2 text-base font-bold capitalize text-vanilla-100">{{ key }}</h3>
            <pre class="text-xs text-vanilla-400">{{ value }}</pre>
          </div>
        </template>
      </div>
    </div>`
})
