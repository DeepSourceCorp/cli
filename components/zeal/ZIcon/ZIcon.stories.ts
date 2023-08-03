import ZIcon from './ZIcon.vue'

import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'

// @ts-expect-error - don't want to declare a badly typed module
import feather from 'feather-icons'
import customIcons from '../../../utils/icon'

async function copyToClipboard(candidate: string) {
  candidate = `<z-icon icon="${candidate}" size="small"></z-icon>`
  try {
    await navigator.clipboard.writeText(candidate)
  } catch (e) {
    const el = document.createElement('input')
    el.value = candidate
    el.select()
    document.execCommand('copy')
    el.remove()
  }
}

export default {
  title: 'Icons',
  component: ZIcon,
  excludeStories: /.*Data$/
}

export const ZealIcons = () => ({
  components: { ZIcon },
  methods: {
    copyToClipboard
  },
  computed: {
    customIcons() {
      return Object.keys(customIcons).sort((a, b) => a.localeCompare(b))
    }
  },
  template: `<div class="space-y-4">
  <div>
    <h3 class="text-lg uppercase tracking-wide text-vanilla-100 font-bold">Zeal Icons</h3>
    <p class="text-vanilla-400 text-xs">Click on the icon to copy</p>
  </div>
  <div class="grid grid-cols-8 gap-3">
    <div
      v-for="icon in customIcons"
      :key="icon"
      @click="copyToClipboard(icon)"
      class="rounded-lg border-ink-200 border flex flex-col space-y-2 text-center items-center justify-center px-2 py-4 h-28 hover:bg-ink-300 cursor-pointer"
    >
      <z-icon :icon="icon" size="medium"></z-icon>
      <span class="text-xs text-vanilla-300">{{ icon }}</span>
    </div>
  </div>
</div>`
})
export const FeatherIcons = () => ({
  components: { ZIcon },
  methods: {
    copyToClipboard
  },
  computed: {
    featherIcons() {
      return Object.keys(feather.icons).sort((a, b) => a.localeCompare(b))
    }
  },
  template: `<div class="space-y-4">
  <div>
    <h3 class="text-lg uppercase tracking-wide text-vanilla-100 font-bold">Feather Icons</h3>
    <p class="text-vanilla-400 text-xs">Click on the icon to copy</p>
  </div>
  <div class="grid grid-cols-8 gap-3">
    <div
      v-for="icon in featherIcons"
      :key="icon"
      @click="copyToClipboard(icon)"
      class="rounded-lg border-ink-200 border flex flex-col space-y-2 text-center items-center justify-center px-2 py-4 h-22 hover:bg-ink-300 cursor-pointer"
    >
      <z-icon :icon="icon" size="medium"></z-icon>
      <span class="text-xs text-vanilla-300">{{ icon }}</span>
    </div>
  </div>
</div>`
})

export const Default = () => ({
  components: { ZIcon },
  template: `<div class='wrapper'>
        <z-icon icon='arrow-up'></z-icon>
        <p class="icon-title">arrow-up</p>
    </div>`
})

export const IconWithCustomColor = () => ({
  components: { ZIcon },
  template: `<div class="wrapper">
        <z-icon icon="activity" color="juniper"></z-icon>
        <p class="icon-title">activity</p>
    </div>`
})

export const SmallIcon = () => ({
  components: { ZIcon },
  template: `<div class='wrapper'>
        <z-icon icon='arrow-up' size="small"></z-icon>
        <p class='icon-title'>arrow-up</p>
    </div>`
})

export const ExtraSmallIcon = () => ({
  components: { ZIcon },
  template: `<div class='wrapper'>
        <z-icon icon='arrow-up' size="x-small"></z-icon>
        <p class='icon-title'>arrow-up</p>
    </div>`
})
