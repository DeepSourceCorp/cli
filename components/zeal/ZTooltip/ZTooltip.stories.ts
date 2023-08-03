import Vue from 'vue'
import ZIcon from '../ZIcon/ZIcon.vue'
import VTooltip from 'floating-vue'

Vue.use(VTooltip)

import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import '../../assets/css/tooltip.css'
import './customTooltipStyle.css'

export default {
  title: 'Tooltip',
  component: ZIcon,
  excludeStories: /.*Data$/
}

const template = `<div class='h-102 w-full flex flex-col justify-center items-center'>
<div class="rounded-md p-2 bg-ink-300" v-tooltip="text">
  <z-icon icon='arrow-up'></z-icon>
</div>
<p class="mt-2 text-vanilla-300 text-xs">Hover over the icon</p>
</div>`

export const Default = () => ({
  components: { ZIcon },
  data() {
    return {
      text: 'This is a simple tooltip'
    }
  },
  template
})

export const CustomBody = () => ({
  components: { ZIcon },
  data() {
    return {
      text: 'This is a <b>bold</b> tooltip with <i>italics</i>'
    }
  },
  template
})

// Don't know why will anyone need this, but here it is
export const LongBody = () => ({
  components: { ZIcon },
  data() {
    return {
      text: `
        <div class="text-left">
          <h1 class="text-sm font-bold">Automatically create pull requests with bug fixes</h1>
          <p class="mt-1">DeepSource Autofix suggests fixes for issues detected and creates pull request with the recommended changes. Avoid the grunt work of fixing these issues manually.</p>
        </div>
      `
    }
  },
  template
})

export const CustomOptions = () => ({
  components: { ZIcon },
  data() {
    return {
      text: {
        content: 'This tooltip shows up instantly, but leaves after 2 seconds',
        delay: { show: 0, hide: 2000 }
      }
    }
  },
  template
})

export const CustomStyle = () => ({
  components: { ZIcon },
  data() {
    return {
      text: { content: 'This tooltip uses a custom css class', classes: 'custom-tooltip' }
    }
  },
  template
})
