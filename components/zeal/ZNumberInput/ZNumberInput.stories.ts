import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'

import ZNumberInput from '.'

export default {
  title: 'Number input',
  component: ZNumberInput,
  excludeStories: /.*Data$/
}

export const BasicNumberInput = () => ({
  components: { ZNumberInput },
  data() {
    return {
      inputNum: 0
    }
  },
  template: `
    <div class="container space-y-5 text-vanilla-100">
      <z-number-input v-model="inputNum" class="w-28" />
      <div class="mt-2">Number: {{ inputNum }}</div>
    </div>`
})

export const NumberInputWithMin = () => ({
  components: { ZNumberInput },
  data() {
    return {
      inputNum: 0
    }
  },
  template: `
    <div class="container space-y-5 text-vanilla-100">
      <z-number-input v-model="inputNum" min="10" class="w-28" />
      <div class="mt-2">Number won't go below 10</div>
    </div>`
})

export const NumberInputWithMax = () => ({
  components: { ZNumberInput },
  data() {
    return {
      inputNum: 0
    }
  },
  template: `
    <div class="container space-y-5 text-vanilla-100">
      <z-number-input v-model="inputNum" max="10" class="w-28" />
      <div class="mt-2">Number won't go above 10</div>
    </div>`
})

export const NumberInputWithMinAndMax = () => ({
  components: { ZNumberInput },
  data() {
    return {
      inputNum: 0
    }
  },
  template: `
    <div class="container space-y-5 text-vanilla-100">
      <z-number-input v-model="inputNum" min="0" max="10" class="w-28" />
      <div class="mt-2">Number will stay between 0 and 10</div>
    </div>`
})
