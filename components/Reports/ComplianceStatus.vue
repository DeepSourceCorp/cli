<template>
  <div class="flex items-center gap-x-1.5 leading-8">
    <span class="w-1.5 h-1.5 rounded-full" :class="compliancePassed ? 'bg-juniper' : 'bg-cherry'" />
    <span
      class="text-sm font-semibold tracking-wider uppercase text-13px"
      :class="compliancePassed ? 'text-juniper' : 'text-cherry'"
    >
      {{ compliancePassed ? 'Passing' : 'Failing' }}
    </span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * Component to show complaince failing or passing.
 */
@Component({})
export default class ComplianceStatus extends Vue {
  @Prop({ required: true })
  compliancePassed: boolean
}
</script>

<style scoped>
.text-13px {
  font-size: 0.8125rem;
}
</style>
