import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'

import Vue from 'vue'

import ZInput from './ZInput.vue'
import ZIcon from '@/components/ZIcon/ZIcon.vue'
import ZButton from '@/components/ZButton/ZButton.vue'

export default {
  title: 'Input',
  component: ZInput,
  excludeStories: /.*Data$/
}

export const InputWithCustomPlaceholder = () => ({
  components: { ZInput },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
            <z-input v-model="name"
                    placeholder="captainmarvel@marvel.com"></z-input>
        </div>
    </div>`
})

export const DebounceInput = () =>
  Vue.extend({
    components: { ZInput },
    data() {
      return {
        name: '',
        delayname: '',
        debouncedValue: '',
        delayDebouncedValue: ''
      }
    },
    methods: {
      debounce(val: string): void {
        this.debouncedValue = val
      },
      delayDebounce(val: string): void {
        this.delayDebouncedValue = val
      }
    },
    template: `<div class='padded-container space-y-6'>
        <div class="input-container space-y-2">
            <z-input @debounceInput="debounce" v-model="name" :clearable="true" :showBorder="false" backgroundColor="ink-200"></z-input>
            <p class="text-vanilla-100 text-sm">Debounced Value: {{debouncedValue}}</p>
        </div>
        <div class="input-container space-y-2">
            <z-input :debounceDelay="1200" @debounceInput="delayDebounce" v-model="delayname" :clearable="true" :showBorder="false" backgroundColor="ink-200"></z-input>
            <p class="text-vanilla-100 text-sm">Delayed Debounced Value: {{delayDebouncedValue}}</p>
        </div>
    </div>`
  })

export const DisabledInput = () => ({
  components: { ZInput },
  data() {
    return {
      name: 'Hello World'
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
            <z-input v-model="name"
                    :disabled="true"></z-input>
        </div>
    </div>`
})

export const ReadOnly = () => ({
  components: { ZInput },
  data() {
    return {
      name: 'Hello World'
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
            <z-input v-model="name" 
                    :readOnly="true"></z-input>
        </div>
    </div>`
})

export const ErroredInput = () => ({
  components: { ZInput },
  data() {
    return {
      name: 'Hello World'
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
            <z-input v-model="name" :isInvalid="true"></z-input>
        </div>
    </div>`
})

export const InputWithDifferentSizes = () => ({
  components: { ZInput, ZButton },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="max-w-md space-y-2">
          <div class="flex items-center space-x-2">
            <z-input v-model="name" size="x-small"></z-input>
          </div>
          <div class="flex items-center space-x-2">
            <z-input v-model="name" size="small"></z-input>
          </div>
          <div class="flex items-center space-x-2">
            <z-input v-model="name" size="medium"></z-input>
          </div>
          <div class="flex items-center space-x-2">
            <z-input v-model="name" size="large"></z-input>
          </div>
          <div class="flex items-center space-x-2">
            <z-input v-model="name" size="xlarge"></z-input>
          </div>
        </div>
    </div>`
})

export const InputBorderAndBackground = () => ({
  components: { ZInput },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
            <z-input v-model="name" :showBorder="false" backgroundColor="ink-200"></z-input>
        </div>
    </div>`
})

export const StandAloneInput = () => ({
  components: { ZInput },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
            <z-input v-model="name"></z-input>
        </div>
    </div>`
})

export const InputWithLeftIcon = () => ({
  components: { ZInput, ZIcon },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
          <z-input v-model="name">
            <template slot="left">
              <z-icon icon="search" size="small"></z-icon>
            </template>
          </z-input>
        </div>
    </div>`
})

export const InputWithRightIcon = () => ({
  components: { ZInput, ZIcon },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
          <z-input v-model="name">
            <template slot="right">
              <z-icon icon="search" size="small"></z-icon>
            </template>
          </z-input>
        </div>
    </div>`
})

export const InputWithIconsOnEitherSides = () => ({
  components: { ZInput, ZIcon },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
          <z-input v-model="name">
            <template slot="left">
              <z-icon icon="search" size="small"></z-icon>
            </template>
            <template slot="right">
              <z-icon icon="check" size="small"></z-icon>
            </template>
          </z-input>
        </div>
    </div>`
})

export const InputWithLeftButton = () => ({
  components: { ZInput, ZButton },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
          <z-input v-model="name" size="medium">
            <template slot="left">
              <z-button buttonType="primary" size="small" icon="chevron-left" iconSize="medium" iconColor="ink-400"></z-button>
            </template>
          </z-input>
        </div>
    </div>`
})

export const InputWithRightButton = () => ({
  components: { ZInput, ZButton },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
          <z-input v-model="name" size="medium">
            <template slot="right">
              <z-button buttonType="primary" size="small" icon="chevron-right" iconSize="medium" iconColor="ink-400"></z-button>
            </template>
          </z-input>
        </div>
    </div>`
})

export const InputWithClearables = () => ({
  components: { ZInput, ZIcon },
  data() {
    return {
      name: 'Hello World'
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
          <z-input v-model="name" :clearable="true">
          </z-input>
        </div>
    </div>`
})

export const InputWithMaxLength = () => ({
  components: { ZInput },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
            <z-input v-model="name"
              type="text"
              max-length="5"
              placeholder="Max. 5 characters"
            >
            </z-input>
        </div>
    </div>`
})

export const InputWithMinLength = () => ({
  components: { ZInput },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
            <z-input v-model="name"
              type="text"
              min-length="5"
              placeholder="Min. 5 characters"
            >
            </z-input>
        </div>
    </div>`
})

export const InputWithMultipleEmails = () => ({
  components: { ZInput },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
            <z-input v-model="name"
                    type="email"
                    :multiple="true"
                    placeholder="Add multiple emails">
            </z-input>
        </div>
    </div>`
})

export const InputWithValidationOnBlur = () => ({
  components: { ZInput },
  data() {
    return {
      name: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container">
            <z-input v-model="name"
                    :required="true"
                    :validate-on-blur="true"
                    placeholder="Invalid when empty">
            </z-input>
        </div>
    </div>`
})
