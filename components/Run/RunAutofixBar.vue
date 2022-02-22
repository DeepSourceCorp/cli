<template>
  <div class="flex items-center justify-between px-4 py-2 mb-4 text-sm bg-ink-300">
    <span
      >{{ autofixableIssues.length }} {{ autofixableIssues.length === 1 ? 'issue' : 'issues' }} can
      be Autofixed in
      {{ filesAffectedByAutofix }}
      {{ filesAffectedByAutofix > 1 ? 'files' : 'file' }}</span
    >
    <z-button
      :disabled="!canCreateAutofix"
      button-type="primary"
      size="small"
      spacing="px-10"
      icon="autofix"
      label="Autofix"
      @click="isAutofixOpen = true"
    />
    <autofix-issues-chooser
      :is-open="isAutofixOpen"
      :autofixable-issues="autofixableIssues"
      :check-id="id"
      @close="isAutofixOpen = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZButton } from '@deepsourcelabs/zeal'
import { AutofixIssuesChooser } from '@/components/RepoIssues'
import { AutofixableIssueDetail } from '@/types/types'

export interface RunError {
  level: number
  message: string
}

/**
 * Bar to show autofix counts and button to trigger it
 */
@Component({
  components: {
    ZButton,
    AutofixIssuesChooser
  }
})
export default class RunAutofixBar extends Vue {
  @Prop({ default: '' })
  id: string

  @Prop({ default: 0 })
  issuesRaisedCount: number

  @Prop({ default: 0 })
  issuesResolvedCount: number

  @Prop({ default: '' })
  autofixableIssues: AutofixableIssueDetail

  @Prop({ default: true })
  canCreateAutofix!: boolean

  @Prop({ default: '' })
  filesAffectedByAutofix: number

  public isAutofixOpen = false
}
</script>
