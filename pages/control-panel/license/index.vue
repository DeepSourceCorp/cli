<template>
  <div class="p-4">
    <h1 class="text-lg font-medium">License overview</h1>
    <div class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        class="border border-slate-400 rounded-md py-3 px-3.5 bg-ink-300 flex flex-col justify-between min-h-23"
      >
        <p class="text-sm font-medium tracking-wider uppercase text-vanilla-400">Total seats</p>
        <span class="text-xl font-semibold">{{ orgLicenseData.seatsTotal }}</span>
      </div>
      <div
        class="border border-slate-400 rounded-md py-3 px-3.5 bg-ink-300 flex flex-col justify-between min-h-23"
      >
        <p class="text-sm font-medium tracking-wider uppercase text-vanilla-400">Seats used</p>
        <span class="text-xl font-semibold">{{ orgLicenseData.seatsUsed }}</span>
      </div>
      <div
        class="border border-slate-400 rounded-md py-3 px-3.5 bg-ink-300 flex flex-col justify-between min-h-23"
      >
        <p class="text-sm font-medium tracking-wider uppercase text-vanilla-400">Valid till</p>
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
      <template slot="controls">
        <graph-control
          class="float-right w-full h-8 xl:w-auto"
          :filter-value="lastDays"
          :day-options="[180, 240, 360]"
          :display-duration-type="DurationTypeMonths"
          @updateFilter="updateLastDays"
        ></graph-control>
      </template>
      <div class="flex items-center gap-x-6 px-7 ml-0.5 pt-4 text-vanilla-400">
        <div class="flex items-center gap-x-2">
          <div class="w-2 h-2 rounded-full bg-vanilla-400"></div>
          <p class="text-sm">Seats remaining</p>
        </div>
        <div class="flex items-center gap-x-2">
          <div class="w-2 h-2 rounded-full bg-robin-500"></div>
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
      ></base-graph>
    </stat-section>
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsource/zeal'

import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { OrgLicenseActions, OrgLicenseGetters } from '~/store/control-panel/license'
import { License, TrendType } from '~/types/types'

import { formatDate, parseISODate, DurationTypeT } from '~/utils/date'

const licenseStore = namespace('control-panel/license')

@Component({
  components: { ZIcon, ZButton },
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
