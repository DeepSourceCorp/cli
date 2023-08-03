<template>
  <component
    :is="to ? 'nuxt-link' : 'div'"
    :to="to"
    class="group block"
    :class="{
      'rounded-lg border border-slate-400': !removeDefaultStyle,
      'bg-ink-400 hover:bg-ink-300': to && !removeDefaultStyle
    }"
    @click="$emit('click')"
  >
    <div
      v-if="$slots.header"
      class="border-b border-slate-400 p-3 text-sm text-vanilla-400 group-hover:border-slate-400"
    >
      <slot name="header"></slot>
    </div>
    <div class="flex w-full flex-1 flex-wrap">
      <!-- Left Section -->
      <slot name="left-section">
        <div
          class="space-y-1 border-slate-400 text-sm text-vanilla-400"
          :class="[{ 'w-full md:w-4/5': showInfo }, customPadding]"
        >
          <div class="flex items-center space-x-2 text-base font-semibold text-vanilla-200">
            <slot name="title">{{ title }} </slot>
          </div>
          <slot name="description">{{ description }}</slot>
        </div>
      </slot>
      <!-- Right Section -->
      <div
        v-if="showInfo"
        class="hidden w-full md:block md:w-1/5"
        :class="{
          'border-slate-400 group-hover:border-slate-400 sm:border-l': !removeDefaultStyle
        }"
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

  @Prop({ default: 'p-3' })
  customPadding: string
}
</script>
