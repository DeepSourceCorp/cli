<template>
  <main>
    <header class="space-y-4 md:space-y-1 border-b border-slate-400 pb-8">
      <h1 class="text-lg md:text-2xl font-semibold">{{ label }}</h1>
      <p class="text-vanilla-400 tracking-wide text-xs md:text-sm font-medium">
        Created on {{ createdAt }}
      </p>
    </header>

    <section class="space-y-14 mt-8 leading-8">
      <!-- Unsanitized v-html because copy text is in bifrost -->
      <div
        v-if="copyText.summary"
        class="space-y-4 text-vanilla-400"
        v-html="copyText.summary"
      ></div>
      <div
        v-if="copyText.intendedUse"
        class="space-y-4 text-vanilla-400"
        v-html="copyText.intendedUse"
      ></div>
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

import { ReportLevel, ReportType } from '~/types/types'
import { ReportCopyTextT, ReportMeta, ReportPageT } from '~/types/reportTypes'
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

  ReportType = ReportType

  get copyText(): ReportCopyTextT {
    return ReportMeta[this.reportKey].copyText(this.ownerLogin) ?? { summary: '', intendedUse: '' }
  }

  get label(): string {
    return `${ReportMeta[this.reportKey].title} report` ?? ''
  }
}
</script>
