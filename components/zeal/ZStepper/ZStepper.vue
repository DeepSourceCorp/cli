<template>
  <div class="z-stepper flex" :class="{ 'flex-col': align == 'vertical' }">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'ZStepper',
  props: {
    active: {
      default: 0,
      type: Number
    },
    align: {
      default: 'horizontal',
      type: String
    },
    showNumbers: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      steps: [],
      stepOffSet: 0
    }
  },
  methods: {
    updateSteps() {
      this.steps.forEach((step, index) => {
        step.index = index
        step.align = this.align
        step.showNumbers = this.showNumbers

        if (index === this.active) {
          step.internalStatus = 'active'
        } else if (index < this.active) {
          step.internalStatus = 'completed'
        } else {
          step.internalStatus = 'default'
        }
      })
    }
  },
  watch: {
    steps() {
      this.updateSteps()
    },
    active() {
      this.updateSteps()
    }
  }
}
</script>
