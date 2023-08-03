<template>
  <section class="grid grid-cols-2 gap-3 xs:grid-cols-repeat-10">
    <template v-if="loading">
      <div
        v-for="idx in loaderCount"
        :key="idx"
        class="flex flex-col gap-y-3 rounded-md bg-ink-300 p-3"
      >
        <div class="h-4 w-32 animate-pulse bg-ink-200"></div>
        <div class="h-5 w-10 animate-pulse bg-ink-200"></div>
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
