<template>
  <div class="grid gap-y-2.5 p-2.5 pb-3 border-t border-slate-400">
    <p class="text-xs font-semibold tracking-wide uppercase text-slate">Run summary</p>
    <!-- created -->
    <meta-data-item :label="createdString" icon="clock" />

    <!-- gitCompareDisplay -->
    <meta-data-item :label="gitCompareDisplay" icon="git-commit" />

    <!-- finished -->
    <meta-data-item :label="finishedString" icon="timer" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { formatSeconds, fromNow } from '~/utils/date'

/**
 * Sidebar component to show the summary stats of the current run
 *
 */
@Component({
  layout: 'repository'
})
export default class RunSummary extends Vue {
  @Prop({ default: '' })
  createdAt: string

  @Prop({ default: '' })
  finishedIn: number

  @Prop({ default: '' })
  gitCompareDisplay: string

  get createdString(): string {
    return fromNow(this.createdAt)
  }

  get finishedString(): string {
    return formatSeconds(this.finishedIn)
  }
}
</script>
