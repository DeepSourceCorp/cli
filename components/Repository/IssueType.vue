<template>
  <meta-data-item :icon="issueType">
    {{ label }}
  </meta-data-item>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'
import { toTitleCase } from '@/utils/string'

@Component({
  components: {
    ZIcon
  }
})
export default class IssueType extends Vue {
  @Prop({ default: '' })
  issueType!: string

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
