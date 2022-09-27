<template>
  <section class="grid gap-3 grid-cols-2 xs:grid-cols-repeat-10">
    <template v-if="loading">
      <div
        v-for="idx in loaderCount"
        :key="idx"
        class="flex flex-col gap-y-3 p-3 bg-ink-300 rounded-md"
      >
        <div class="h-4 w-32 bg-ink-200 animate-pulse"></div>
        <div class="h-5 w-10 bg-ink-200 animate-pulse"></div>
      </div>
    </template>
    <template v-else>
      <distribution-stat-card
        v-for="stat in stats"
        :key="stat.slug"
        v-bind="stat"
        :link-cards="linkCards"
        :stat-type="statType"
      />
    </template>
  </section>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { IssueDistribution } from '~/types/types'
import { IssueDistributionT } from '~/types/reportTypes'

// Show the category or analyzer wise distribution stats
@Component({
  layout: 'repository'
})
export default class DistributionStats extends Vue {
  @Prop({ default: false })
  loading: boolean

  @Prop({ default: 6 })
  loaderCount: number

  @Prop({ default: false, type: Boolean })
  linkCards: boolean

  @Prop({ required: true })
  stats: Array<IssueDistribution>

  @Prop({ default: IssueDistributionT.CATEGORY })
  statType: IssueDistributionT
}
</script>
