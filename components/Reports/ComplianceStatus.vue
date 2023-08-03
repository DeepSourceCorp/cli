<template>
  <div class="flex items-center gap-x-1.5 leading-8">
    <span
      class="h-1.5 w-1.5 rounded-full"
      :class="compliancePassed ? 'bg-juniper' : 'bg-cherry'"
    ></span>
    <span
      :class="[compliancePassed ? 'text-juniper' : 'text-cherry', textSize]"
      class="font-semibold uppercase tracking-wider"
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

  @Prop({ default: 'text-13px', validator: (value: string) => value.startsWith('text-') })
  textSize: string
}
</script>

<style scoped>
.text-13px {
  font-size: 0.8125rem;
}
</style>
