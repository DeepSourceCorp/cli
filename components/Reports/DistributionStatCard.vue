<template>
  <component
    :is="linkCards ? 'nuxt-link' : 'div'"
    :to="cardLink"
    class="flex flex-col gap-y-3 rounded-md bg-ink-300 p-3 text-vanilla-100"
    :class="{ 'hover:bg-ink-200': linkCards }"
  >
    <h5 class="flex items-center gap-x-2 text-sm font-medium leading-4">
      <img
        v-if="logoUrl"
        class="hidden h-4 w-4 flex-shrink-0 sm:inline-block"
        :src="logoUrl"
        :alt="name"
      />
      <z-icon v-else :icon="slug" color="vanilla-100" class="hidden sm:inline-block" />
      {{ toSentenceCase(name, false) }}
    </h5>
    <div
      v-tooltip="value > 1000 ? `${formatIntl(value)} ${name}` : ''"
      class="text-base font-semibold leading-6"
    >
      {{ shortenLargeNumber(value) }}
    </div>
  </component>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { formatIntl, shortenLargeNumber, toSentenceCase } from '~/utils/string'
import { IssueDistributionT } from '~/types/reportTypes'

// Card component for distribution stats
@Component({
  methods: {
    shortenLargeNumber,
    formatIntl,
    toSentenceCase
  }
})
export default class DistributionStatCard extends Vue {
  @Prop({ default: '' })
  slug: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  value: number

  @Prop({ default: '' })
  logoUrl: string

  @Prop({ default: IssueDistributionT.CATEGORY })
  statType: IssueDistributionT

  @Prop({ default: false, type: Boolean })
  linkCards: boolean

  /**
   * Generate issues page link for a given analyzer
   *
   * @param {string} slug
   *
   * @return {string}
   */
  generateAnalyzerLink(slug?: string): string {
    return slug
      ? `${this.$generateRoute(['issues'])}?category=all&analyzer=${slug}`
      : `${this.$generateRoute(['issues'])}?category=all`
  }

  /**
   * Generate issues page link for the given category
   *
   * @param {string} slug
   *
   * @return {string}
   */
  generateCategoryLink(slug?: string): string {
    return slug
      ? `${this.$generateRoute(['issues'])}?category=${slug}`
      : `${this.$generateRoute(['issues'])}`
  }

  /**
   * Generate link to the issues page if linkCards flag is enabled
   *
   * @param {IssueDistribution} stat
   *
   * @return {string | undefined}
   */
  get cardLink(): string | undefined {
    if (this.linkCards) {
      return this.statType === IssueDistributionT.ANALYZER
        ? this.generateAnalyzerLink(this.slug)
        : this.generateCategoryLink(this.slug)
    }
    return
  }
}
</script>
