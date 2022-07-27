<template>
  <stat-section
    :body-spacing="0"
    :grid-spacing="0"
    :show-border="false"
    class="overflow-hidden border rounded-lg border-ink-200"
    spacing-class="gap-px p-0"
    custom-grid-class="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-5"
  >
    <template v-if="loading">
      <div v-for="idx in loaderCount" :key="idx" class="p-2 space-y-4 h-22 sm:h-24 outline-ink-200">
        <div class="h-6 rounded-md bg-ink-300 w-36 animate-pulse"></div>
        <div class="h-6 rounded-md bg-ink-300 w-14 animate-pulse"></div>
      </div>
    </template>
    <template v-else>
      <template v-for="stat in stats">
        <stat-card
          :key="stat.slug"
          :to="generateLink(stat)"
          :hint-as-tooltip="false"
          :remove-styles="true"
          class="outline-ink-200 hover:bg-ink-300 p-3 md:p-4"
        >
          <template slot="title">
            <h5 class="flex items-center text-base font-medium gap-x-2 text-vanilla-100">
              <img
                v-if="stat.logoUrl"
                class="flex-shrink-0 w-4 h-4"
                :src="stat.logoUrl"
                :alt="stat.name"
              />
              <z-icon v-else :icon="stat.slug" color="vanilla-100" class="hidden sm:inline-block" />
              {{ toSentenceCase(stat.name) }}
            </h5>
          </template>
          <span v-tooltip="stat.value > 1000 ? `${formatIntl(stat.value)} ${stat.name}` : ''">
            {{ shortenLargeNumber(stat.value) }}
          </span>
        </stat-card>
      </template>
    </template>
  </stat-section>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { StatCard, StatSection } from '@/components/Metrics'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import { formatIntl, shortenLargeNumber, toSentenceCase } from '~/utils/string'
import { IssueDistribution } from '~/types/types'
import { IssueDistributionT } from '~/types/reportTypes'

/** Show the category or analyzer wise distribution stats*/
@Component({
  components: {
    StatSection,
    StatCard,
    ZButton,
    ZIcon
  },
  layout: 'repository',
  methods: {
    shortenLargeNumber,
    formatIntl,
    toSentenceCase
  }
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

  /**
   * Generate issues page link for a given analyzer
   *
   * @param {IssueDistribution} stat
   *
   * @return {string}
   */
  generateAnalyzerLink(stat: IssueDistribution): string {
    return `${this.$generateRoute(['issues'])}?category=all&analyzer=${stat.slug}`
  }

  /**
   * Generate issues page link for the given category
   *
   * @param {IssueDistribution} stat
   *
   * @return {string}
   */
  generateCategoryLink(stat: IssueDistribution): string {
    return `${this.$generateRoute(['issues'])}?category=${stat.slug}`
  }

  /**
   * Generate link to the issues page if linkCards flag is enabled
   *
   * @param {IssueDistribution} stat
   *
   * @return {string | undefined}
   */
  generateLink(stat: IssueDistribution): string | undefined {
    if (this.linkCards) {
      if (this.statType === IssueDistributionT.ANALYZER) {
        return this.generateAnalyzerLink(stat)
      }
      return this.generateCategoryLink(stat)
    }
    return
  }
}
</script>
