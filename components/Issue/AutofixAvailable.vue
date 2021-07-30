<template>
  <z-badge
    v-if="autofixableIssuesCount > 0"
    type="success"
    :is-dot="modelValue ? true : false"
    size="md"
  >
    <div
      class="flex items-center max-w-44 space-x-2 p-2 h-8 rounded-sm border border-ink-200 leading-none"
      :class="modelValue ? 'hover:bg-ink-100 bg-ink-200' : 'hover:bg-ink-200 border-dashed'"
    >
      <div
        class="flex items-center space-x-2 text-sm cursor-pointer overflow-hidden overflow-ellipsis"
        @click="modelValue = modelValue ? null : true"
      >
        <z-icon
          icon="autofix"
          size="small"
          :color="!modelValue ? 'vanilla-400' : 'vanilla-100'"
        ></z-icon>
        <span class="truncate" :class="modelValue ? 'text-vanilla-100' : 'text-vanilla-300'"
          >Filter by Autofix</span
        >
        <z-icon
          icon="plus"
          size="small"
          color="vanilla-400"
          class="transform duration-75"
          :class="{
            'rotate-45': modelValue
          }"
        ></z-icon>
      </div>
    </div>
  </z-badge>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ModelSync } from 'vue-property-decorator'
import { ZIcon, ZBadge } from '@deepsourcelabs/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

@Component({
  components: {
    ZIcon,
    ZBadge
  }
})
export default class AutofixAvailable extends mixins(RepoDetailMixin) {
  @ModelSync('autofixAvailable', 'toggleAutofix', { type: String, default: false })
  readonly modelValue: boolean

  get autofixableIssuesCount(): number {
    return this.repository.autofixableIssuesMetadata?.autofixableIssueCount || 0
  }
}
</script>
