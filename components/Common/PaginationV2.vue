<template>
  <div class="flex items-center justify-center gap-x-2">
    <p class="mr-2 text-sm text-vanilla-400">
      {{ start }} - {{ end }} <span class="text-slate-200">of</span> {{ totalCount }}
    </p>

    <z-divider direction="vertical" margin="m-0" />

    <button
      class="h-6 w-6 rounded-sm"
      :class="
        disableBackAction
          ? 'cursor-not-allowed text-slate-200'
          : 'text-vanilla-400 hover:bg-ink-200'
      "
      @click="backActionClickHandler"
    >
      <z-icon color="current" icon="chevron-left" class="mx-auto" />
    </button>

    <button
      class="h-6 w-6 rounded-sm"
      :class="
        disableForwardAction
          ? 'cursor-not-allowed text-slate-200'
          : 'text-vanilla-400 hover:bg-ink-200'
      "
      @click="forwardActionClickHandler"
    >
      <z-icon color="current" icon="chevron-right" class="mx-auto" />
    </button>
  </div>
</template>

<script lang="ts">
import { Component, ModelSync, Prop, Vue } from 'nuxt-property-decorator'

@Component({
  name: 'PaginationV2'
})
export default class PaginationV2 extends Vue {
  @ModelSync('pageNumber', 'change', { type: Number })
  readonly modelValue: number

  @Prop({ required: true, type: Number })
  perPageCount: number

  @Prop({ required: true, type: Number })
  totalCount: number

  get disableBackAction() {
    return this.modelValue <= 1
  }

  get disableForwardAction() {
    return this.modelValue >= Math.ceil(this.totalCount / this.perPageCount)
  }

  get end() {
    const count = this.perPageCount * this.modelValue
    return count > this.totalCount ? this.totalCount : count
  }

  get start() {
    return this.perPageCount * (this.modelValue - 1) + 1
  }

  backActionClickHandler() {
    return this.disableBackAction ? false : this.$emit('change', this.modelValue - 1)
  }

  forwardActionClickHandler() {
    return this.disableForwardAction ? false : this.$emit('change', this.modelValue + 1)
  }
}
</script>
