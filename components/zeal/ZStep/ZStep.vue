<template>
  <div
    class="z-step mr-0"
    :class="{
      'w-1/3 flex-shrink-0 flex-grow-0': align === 'horizontal' && isLast,
      'w-1/2': align === 'horizontal' && !isLast,
      'flex flex-row': align === 'vertical'
    }"
  >
    <div
      class="z-step__head relative"
      :class="{
        currentStatus: true,
        'w-full': align === 'horizontal',
        'flex flex-col justify-center': align === 'vertical' && !isLast
      }"
    >
      <div
        v-if="align === 'horizontal' && !isLast"
        class="z-step__line absolute left-7 right-1 top-2.5 h-0.5 w-auto rounded-sm"
        :class="{
          'bg-juniper': currentStatus === 'completed',
          'bg-ink-200': currentStatus !== 'completed'
        }"
      ></div>
      <div
        class="z-step__icon h-6 w-6 rounded-full"
        :class="{
          'bg-juniper': currentStatus === 'completed',
          'bg-robin': currentStatus === 'active',
          'bg-ink-200': !showNumbers && currentStatus === 'default',
          'bg-ink-100': showNumbers && currentStatus === 'default',
          'flex-shrink-0': align === 'vertical'
        }"
      >
        <span
          v-if="showNumbers"
          class="flex h-full items-center justify-center text-xs font-medium leading-none text-vanilla-100"
        >
          {{ index + 1 }}
        </span>
        <span
          v-else-if="currentStatus === 'active'"
          class="flex h-full items-center justify-center"
        >
          <z-icon icon="circle-dashed" color="vanilla-100" class="stroke-2" />
        </span>
        <span
          v-else-if="currentStatus === 'completed'"
          class="flex h-full items-center justify-center"
        >
          <z-icon icon="check" color="ink-400" class="stroke-2" />
        </span>
      </div>
      <div
        v-if="align === 'vertical' && !isLast"
        class="z-step__line mx-auto my-1 h-full w-0.5 rounded-sm"
        :class="{
          'bg-juniper': currentStatus === 'completed',
          'bg-ink-200': currentStatus !== 'completed'
        }"
      ></div>
    </div>
    <div
      class="z-step__main"
      :class="{ 'mt-4': align === 'horizontal', 'mb-4 ml-4 w-full': align === 'vertical' }"
    >
      <slot name="title">
        <div
          class="z-step__title mt-1 text-xs font-medium uppercase leading-snug tracking-widest text-vanilla-400"
        >
          {{ title }}
        </div>
      </slot>
      <div
        class="z-step__description mt-1 text-sm font-bold leading-6"
        :class="{
          'text-vanilla-200': currentStatus,
          'text-vanilla-400': currentStatus === 'default'
        }"
      >
        <slot name="description" :status="currentStatus">{{ description }}</slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ZStep',
  props: {
    title: {
      required: false,
      default: undefined,
      type: String
    },
    description: {
      required: false,
      default: undefined,
      type: String
    },
    status: {
      required: false,
      type: String,
      default: 'default',
      validator: (value) => {
        return ['default', 'active', 'completed'].includes(value)
      }
    }
  },
  data() {
    return {
      index: -1,
      showNumbers: false,
      internalStatus: 'default',
      align: 'horizontal'
    }
  },
  computed: {
    currentStatus() {
      return this.status || this.internalStatus
    },
    isLast() {
      const parent = this.$parent
      return parent.steps[parent.steps.length - 1] === this
    }
  },
  beforeCreate() {
    const parent = this.$parent
    parent.steps.push(this)
  },
  beforeDestroy() {
    const parent = this.$parent,
      steps = parent.steps
    const index = steps.indexOf(this)
    if (index >= 0) {
      steps.slice(index, 1)
    }
  }
}
</script>
