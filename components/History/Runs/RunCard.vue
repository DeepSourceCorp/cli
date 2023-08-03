<template>
  <base-card
    :to="$generateRoute(['run', runId])"
    :remove-default-style="isRunSkipped"
    :class="{
      'rounded-lg border border-dashed border-ink-200 bg-ink-400 hover:border-ink-50': isRunSkipped
    }"
  >
    <template #left-section>
      <div class="grid w-full grid-cols-fr-8 md:grid-cols-fr-16">
        <div class="gap-2 p-3">
          <div class="flex flex-grow flex-col">
            <section class="flex items-center gap-x-1 text-xs md:text-base">
              <z-icon
                v-tooltip="tagLabel"
                :icon="icon"
                :class="{ 'animate-spin': isPending }"
                :color="iconColor"
                class="mr-0.5 mt-0.5 inline flex-shrink-0 self-center"
              />
              <h3 class="line-clamp-1 inline cursor-pointer font-medium text-vanilla-100">
                {{ title || branchName }}
              </h3>
              <span class="inline font-medium text-vanilla-400">
                <template v-if="!isSecondary">
                  {{ prNumber }}
                </template>
                <template v-else-if="commitOid"> @{{ commitOid.slice(0, 7) }} </template>
              </span>
            </section>
            <section
              class="mt-1 flex flex-grow flex-wrap items-center gap-x-4 gap-y-2 pl-px leading-8"
            >
              <meta-data-item
                v-if="!isPending"
                :label="`${isRunSkipped ? 'Skipped' : 'Analyzed'} ${createdString}`"
                icon="clock"
              />
              <meta-data-item v-else :label="statusText" icon="clock" />
              <meta-data-item
                v-if="isSecondary && issueMetaDataLabel"
                :label="issueMetaDataLabel"
                icon="flag"
                class="md:hidden"
              />
              <section v-if="!isSecondary && $slots.toggleTrigger" class="flex-shrink-0">
                <slot name="toggleTrigger"></slot>
              </section>
            </section>
          </div>
        </div>
        <!-- stats-->
        <div
          v-if="showIssueStats"
          class="border-l border-slate-400"
          :class="{ 'hidden md:block': isSecondary }"
        >
          <div
            class="grid h-full flex-shrink-0 grid-cols-1 items-center justify-around divide-y divide-ink-200 md:grid-cols-2 md:gap-x-0 md:divide-y-0"
          >
            <div
              v-for="stat in issueStats"
              :key="stat.label"
              class="grid h-full w-full place-content-center p-2 text-center md:w-full md:p-3"
            >
              <div
                class="text-sm font-semibold md:text-1.5xl"
                :class="{
                  'text-cherry': !stat.isPositive,
                  'text-juniper': stat.isPositive,
                  'text-vanilla-400': Number(stat.value) === 0
                }"
              >
                {{ stat.value }}
              </div>
              <div class="text-xxs text-vanilla-400 md:text-xs">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { BaseCard } from '../'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { fromNow } from '@/utils/date'
import { shortenLargeNumber } from '@/utils/string'
import { RunStatus } from '~/types/types'
import { runStatusIcon, runStatusIconColor, runStatusTagLabel } from '~/utils/ui'
import { GeneralizedRunT, generalizeRunStatuses } from '~/utils/runs'

@Component({
  components: {
    BaseCard
  }
})
export default class RunCard extends mixins(RepoDetailMixin) {
  @Prop({ default: '' })
  title: GeneralizedRunT['title']

  @Prop({ default: RunStatus.Pass })
  status: GeneralizedRunT['status']

  @Prop({ default: '' })
  branchName: GeneralizedRunT['branchName']

  @Prop({ default: '' })
  runId: GeneralizedRunT['runId']

  @Prop({ default: '' })
  createdAt: GeneralizedRunT['createdAt']

  @Prop({ default: '' })
  commitOid: GeneralizedRunT['commitOid']

  @Prop({ default: '' })
  prNumber: GeneralizedRunT['prNumber']

  @Prop({ default: 0 })
  issuesRaisedCount: GeneralizedRunT['issuesRaisedCount']

  @Prop({ default: 0 })
  issuesResolvedCount: GeneralizedRunT['issuesResolvedCount']

  @Prop({ default: false })
  isSecondary: boolean

  get icon(): string {
    return runStatusIcon(this.status)
  }

  get iconColor(): string {
    return runStatusIconColor(this.status)
  }

  get tagLabel(): string {
    return runStatusTagLabel(this.status)
  }

  get statusText(): string {
    return runStatusTagLabel(this.status, true)
  }

  get isPending(): boolean {
    return this.status === RunStatus.Pend
  }

  get issueStats(): { label: string; value: number | string; isPositive: boolean | null }[] {
    const stats = []
    stats.push({
      label: 'introduced',
      value: shortenLargeNumber(this.issuesRaisedCount ?? 0),
      isPositive: this.issuesRaisedCount === 0 ? null : false
    })

    stats.push({
      label: 'resolved',
      value: shortenLargeNumber(this.issuesResolvedCount ?? 0),
      isPositive: this.issuesResolvedCount === 0 ? null : true
    })

    return stats
  }

  get issueMetaDataLabel(): string {
    let label = ''
    if (this.issueStats[0].value !== '0')
      label = label.concat(`${this.issueStats[0].value} issues introduced`)
    if (this.issueStats[1].value !== '0')
      label = label.concat(`${label.length > 0 && ', '}${this.issueStats[1].value} issues resolved`)
    return label
  }

  get createdString(): string {
    // return '2mins'
    return fromNow(this.createdAt)
  }

  get isRunSkipped(): boolean {
    return generalizeRunStatuses(this.status).status === RunStatus.Skip
  }

  get showIssueStats() {
    return this.issueStats.length && !this.isPending && !this.isRunSkipped
  }
}
</script>
