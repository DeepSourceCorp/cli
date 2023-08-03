import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'

import ZIcon from '@/components/ZIcon/ZIcon.vue'
import ZInputGroup from '@/components/ZInputGroup/ZInputGroup.vue'

export default {
  title: 'InputGroup',
  component: ZInputGroup,
  excludeStories: /.*Data$/
}

export const BasicInputGroupWithAddon = () => ({
  components: { ZInputGroup },
  data() {
    return {
      name: 'Hello World',
      sizes: ['x-small', 'small', 'medium', 'large', 'xlarge']
    }
  },
  template: `
    <div class='padded-container'>
      <div class="input-container">
        <z-input-group v-model="name" prefix="www." addon-bg-color="bg-juniper" />
      </div>
    </div>
      `
})

export const InputGroupWithAddonAsIcon = () => ({
  components: { ZInputGroup, ZIcon },
  data() {
    return {
      name: 'Hello World',
      sizes: ['x-small', 'small', 'medium', 'large', 'xlarge']
    }
  },
  template: `
    <div class='padded-container'>
      <div class="input-container">
        <z-input-group v-model="name" addon-bg-color="bg-ink-200">
          <template #addon>
            <z-icon icon="at-sign" class="stroke-2 mx-1" color="vanilla-400">
          </template
        </z-input-group>
      </div>
    </div>
      `
})

export const Sizes = () => ({
  components: { ZInputGroup },
  filters: {
    capitalize(value: string) {
      if (!value) {
        return ''
      }
      return value.toString().charAt(0).toUpperCase() + value.slice(1)
    }
  },
  data() {
    return {
      name: 'Hello World',
      sizes: ['x-small', 'small', 'medium', 'large', 'xlarge']
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container space-y-4">
        <div v-for="size in sizes" :key="size" class="space-y-2">
          <h3 class="text-vanilla-100 text-xl font-semibold">{{ size | capitalize }}</h3>
          <z-input-group v-model="name" :size="size" prefix="www." addon-bg-color="bg-juniper" />
        </div>
          </div>
    </div>`
})

export const TextBeingTyped = () => ({
  components: { ZInputGroup },
  data() {
    return {
      name: '',
      sizes: ['x-small', 'small', 'medium', 'large', 'xlarge']
    }
  },
  template: `
    <div class='padded-container'>
      <div class="input-container space-y-2">
        <p class="text-vanilla-400">You typed: <span class="text-vanilla-100">{{ name }}</span></p>
        <z-input-group v-model="name" prefix="www." addon-bg-color="bg-juniper" />
      </div>
    </div>
      `
})
