<template>
  <div class="p-4">
    <h1 class="text-lg font-medium">License overview</h1>
    <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        class="flex min-h-23 flex-col justify-between rounded-md border border-slate-400 bg-ink-300 px-3.5 py-3"
      >
        <p class="text-sm font-medium uppercase tracking-wider text-vanilla-400">Total seats</p>
        <span class="text-xl font-semibold">{{ orgLicenseData.seatsTotal }}</span>
      </div>
      <div
        class="flex min-h-23 flex-col justify-between rounded-md border border-slate-400 bg-ink-300 px-3.5 py-3"
      >
        <p class="text-sm font-medium uppercase tracking-wider text-vanilla-400">Seats used</p>
        <span class="text-xl font-semibold">{{ orgLicenseData.seatsUsed }}</span>
      </div>
      <div
        class="flex min-h-23 flex-col justify-between rounded-md border border-slate-400 bg-ink-300 px-3.5 py-3"
      >
        <p class="text-sm font-medium uppercase tracking-wider text-vanilla-400">Valid till</p>
        <span class="text-xl font-semibold">{{
          formatDate(parseISODate(orgLicenseData.licenseExpiry))
        }}</span>
      </div>
    </div>
    <stat-section
      title="License usage history"
      help-text="Summary of seats used over time"
      :full-width="true"
      :body-is-grid="false"
      :body-spacing="0"
      class="mt-6"
    >
      <template #controls>
        <graph-control
          class="float-right h-8 w-full xl:w-auto"
          :filter-value="lastDays"
          :day-options="[180, 240, 360]"
          :display-duration-type="DurationTypeMonths"
          @updateFilter="updateLastDays"
        />
      </template>
      <div class="ml-0.5 flex items-center gap-x-6 px-7 pt-4 text-vanilla-400">
        <div class="flex items-center gap-x-2">
          <div class="h-2 w-2 rounded-full bg-vanilla-400"></div>
          <p class="text-sm">Seats remaining</p>
        </div>
        <div class="flex items-center gap-x-2">
          <div class="h-2 w-2 rounded-full bg-robin-500"></div>
          <p class="text-sm">Seats used</p>
        </div>
      </div>
      <base-graph
        v-if="chartDataAvailable"
        :datasets="datasetArr"
        :labels="orgLicenseData.seatUsageTrend.labels"
        :show-control="false"
        :height="290"
        :colors="['robin-500', 'vanilla-400']"
        :spline="false"
        type="bar"
        :bar-options="{ stacked: 1, spaceRatio: 0.6 }"
      />
    </stat-section>
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'

import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { OrgLicenseActions, OrgLicenseGetters } from '~/store/control-panel/license'
import { License, TrendType } from '~/types/types'

import { formatDate, parseISODate, DurationTypeT } from '~/utils/date'

const licenseStore = namespace('control-panel/license')

@Component({
  layout: 'control-panel',
  methods: { formatDate, parseISODate }
})
export default class LicenseHome extends mixins(ControlPanelBaseMixin) {
  @licenseStore.Getter(OrgLicenseGetters.ORG_LICENSE_DATA)
  orgLicenseData: License

  @licenseStore.Action(OrgLicenseActions.FETCH_ORG_LICENSE_DATA)
  fetchOrgLicenseData: (args: { lastDays: number; trendType: TrendType }) => Promise<void>

  DurationTypeMonths = DurationTypeT.months
  lastDays = 180

  async fetch(): Promise<void> {
    await this.fetchOrgLicenseData({ lastDays: this.lastDays, trendType: TrendType.Monthly })
  }

  get chartDataAvailable(): boolean {
    return !!this.orgLicenseData.seatUsageTrend?.datasets?.[0]?.values?.length
  }

  get datasetArr(): any[] {
    return this.orgLicenseData.seatUsageTrend.datasets
  }

  updateLastDays(durationInDays: number): void {
    this.lastDays = durationInDays
    this.$fetch()
  }
}
</script>
