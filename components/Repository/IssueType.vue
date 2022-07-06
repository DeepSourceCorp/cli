<template>
  <div :key="issueType" class="flex items-center" :class="[spacing]">
    <z-icon :icon="issueType" size="x-small" color="vanilla-400"></z-icon>
    <span class="text-vanilla-400 tracking-wide" :class="[textSize]">{{ label }}</span>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { toTitleCase } from '@/utils/string'

@Component({
  components: {
    ZIcon
  }
})
export default class IssueType extends Vue {
  @Prop({ default: '' })
  issueType!: string

  @Prop({ default: 'space-x-1.5' })
  spacing!: string

  @Prop({ default: 'text-sm' })
  textSize: string

  get label(): string {
    const titles: Record<string, string> = {
      doc: 'Documentation',
      antipattern: 'Anti-pattern',
      style: 'Style',
      'bug-risk': 'Bug risk',
      security: 'Security',
      performance: 'Performance',
      typecheck: 'Typecheck',
      coverage: 'Coverage'
    }
    if (this.issueType in titles) {
      return titles[this.issueType]
    }
    return toTitleCase(this.issueType).replace(/-/g, ' ')
  }
}
</script>
