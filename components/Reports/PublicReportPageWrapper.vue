<template>
  <main>
    <header class="space-y-4 md:space-y-1 border-b border-ink-200 pb-8">
      <h1 class="text-lg md:text-2xl font-semibold">{{ label }}</h1>
      <p class="text-vanilla-400 tracking-wide text-xs md:text-sm font-medium">
        Created on {{ createdAt }}
      </p>
    </header>

    <section class="space-y-14 mt-8 leading-8">
      <div v-html="copyText.summary" class="space-y-4 text-vanilla-400"></div>
      <div v-html="copyText.intendedUse" class="space-y-4 text-vanilla-400"></div>
      <div class="space-y-4 text-vanilla-400">
        <h1 id="continuous-code-health" class="text-lg text-vanilla-100 font-semibold scroll-mt-8">
          Continuous Code Health
        </h1>
        <p>
          DeepSource integrates with {{ smartApostrophe(ownerLogin) }} software development
          workflows to provide developers and key stakeholders a way to identify and fix code health
          issues continuously and proactively. This report is dynamic. As
          {{ smartApostrophe(ownerLogin) }} team improves its source code security posture, the
          changes will be reflected in this report.
        </p>
      </div>
      <slot></slot>
    </section>
  </main>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

import { ReportLevel, ReportType, Repository } from '~/types/types'
import { ReportMeta, ReportPageT } from '~/types/reportTypes'
import { smartApostrophe } from '~/utils/string'

/**
 * Public Report Child page
 */
@Component({
  methods: {
    smartApostrophe
  }
})
export default class PublicReportPageWrapper extends Vue {
  @Prop({ required: true })
  level: ReportLevel

  @Prop({ required: true })
  ownerLogin: string

  @Prop({ required: true })
  createdAt: string

  @Prop({ required: true })
  reportKey: ReportPageT

  @Prop()
  repositoryList: Array<Repository>

  ReportType = ReportType

  get copyText() {
    return ReportMeta[this.reportKey].copyText(this.ownerLogin) ?? ''
  }

  get label() {
    const title = ReportMeta[this.reportKey].title
    const type = String(ReportMeta[this.reportKey].type?.toLowerCase())
    if (this.level === ReportLevel.Repository) {
      const repo = this.repositoryList[0]
      return `${title} ${type} report for ${this.ownerLogin}/${repo.name}`
    }
    if (this.level === ReportLevel.Owner) {
      return `${title} ${type} report for ${this.ownerLogin}`
    }

    return ''
  }
}
</script>
