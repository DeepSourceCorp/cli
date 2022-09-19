<template>
  <base-card :to="getRoute(runId)">
    <template #left-section>
      <div class="w-full grid grid-cols-fr-8 md:grid-cols-fr-16">
        <div class="gap-2 p-3">
          <div class="flex flex-col flex-grow">
            <section class="flex items-center text-xs gap-x-1 md:text-base">
              <z-icon
                v-tooltip="tagLabel"
                class="self-center flex-shrink-0 inline mt-0.5 mr-0.5"
                :icon="icon"
                :class="{ 'animate-spin': isPending }"
                :color="iconColor"
              />
              <h3 class="inline font-medium cursor-pointer text-vanilla-100 line-clamp-1">
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
              class="flex flex-wrap items-center flex-grow pl-px mt-1 leading-8 gap-x-4 gap-y-2"
            >
              <meta-data-item v-if="!isPending" :label="`Analyzed ${createdString}`" icon="clock" />
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
          v-if="issueStats.length && !isPending"
          class="border-l border-ink-200"
          :class="{ 'hidden md:block': isSecondary }"
        >
          <div
            class="grid items-center justify-around flex-shrink-0 h-full grid-cols-1 divide-y md:grid-cols-2 md:gap-x-0 md:divide-y-0 divide-ink-200"
          >
            <div
              v-for="stat in issueStats"
              :key="stat.label"
              class="grid w-full h-full p-2 text-center md:w-full place-content-center md:p-3"
            >
              <div
                class="text-sm md:text-1.5xl font-semibold"
                :class="{
                  'text-cherry': !stat.isPositive,
                  'text-juniper': stat.isPositive,
                  'text-vanilla-400': Number(stat.value) === 0
                }"
              >
                {{ stat.value }}
              </div>
              <div class="text-xxs md:text-xs text-vanilla-400">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { BaseCard } from '../'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { fromNow } from '@/utils/date'
import { shortenLargeNumber } from '@/utils/string'
import { RunStatus } from '~/types/types'
import { runStatusIcon, runStatusIconColor, runStatusTagLabel } from '~/utils/ui'
import { GeneralizedRunT } from '~/utils/runs'

@Component({
  components: {
    BaseCard,
    ZIcon
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

  getRoute(candidate: string): string {
    return this.$generateRoute(['run', candidate])
  }

  get issueStats(): { label: string; value: string; isPositive: boolean | null }[] {
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
}
</script>
