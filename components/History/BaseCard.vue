<template>
  <component
    :is="to ? 'nuxt-link' : 'div'"
    :to="to"
    @click="$emit('click')"
    class="block group"
    :class="{
      'border rounded-lg border-ink-200': !removeDefaultStyle,
      'hover:bg-ink-300': to && !removeDefaultStyle
    }"
  >
    <div
      v-if="$slots.header"
      class="p-3 border-ink-300 group-hover:border-ink-200 border-b text-sm text-vanilla-400"
    >
      <slot name="header"></slot>
    </div>
    <div class="flex flex-wrap w-full flex-1">
      <!-- Left Section -->
      <div
        class="border-ink-300 text-sm text-vanilla-400 px-4 py-3 flex flex-col justify-evenly space-y-1"
        :class="{ 'w-full md:w-4/5': showInfo }"
      >
        <div
          class="text-base sm:text-lg items-center font-semibold flex space-x-2 text-vanilla-200"
        >
          <slot name="title">{{ title }} </slot>
        </div>
        <slot name="description">{{ description }}</slot>
      </div>
      <!-- Right Section -->
      <div
        v-if="showInfo"
        class="hidden md:block md:w-1/5 w-full sm:border-l border-ink-300 group-hover:border-ink-200"
      >
        <slot name="info"></slot>
      </div>
    </div>
  </component>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class BaseCard extends Vue {
  @Prop({ default: true })
  showInfo: boolean

  @Prop({ default: '' })
  to: string

  @Prop({ default: '' })
  title: string

  @Prop({ default: '' })
  description: string

  @Prop({ default: false })
  removeDefaultStyle: boolean
}
</script>
