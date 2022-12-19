<template>
  <z-radio-group v-model="activeFilter" class="min-w-52 h-8 font-medium text-vanilla-100 leading-6">
    <z-radio-button
      :value="IssueDistributionT.CATEGORY"
      spacing="w-full h-full pt-1"
      class="text-center"
    >
      <span class="w-full text-xs capitalize">By category</span>
    </z-radio-button>
    <z-radio-button
      :value="IssueDistributionT.ANALYZER"
      spacing="w-full h-full pt-1"
      class="text-center"
    >
      <span class="w-full text-xs capitalize">By analyzer</span>
    </z-radio-button>
  </z-radio-group>
</template>

<script lang="ts">
import { Vue, Component, ModelSync } from 'nuxt-property-decorator'
import { ZRadioGroup, ZRadioButton } from '@deepsource/zeal'
import { IssueDistributionT } from '~/types/reportTypes'

/**
 * Component to allow category selection for reports.
 */
@Component({
  components: {
    ZRadioGroup,
    ZRadioButton
  }
})
export default class DistributionSwitch extends Vue {
  @ModelSync('selectedFilter', 'change', { type: String, default: '' })
  readonly activeFilter: string

  IssueDistributionT = IssueDistributionT
}
</script>
