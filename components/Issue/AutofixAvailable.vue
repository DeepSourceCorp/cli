<template>
  <z-badge v-if="autofixableIssuesCount > 0" type="success" :is-dot="modelValue ? true : false">
    <div
      class="max-w-44 flex h-8 items-center space-x-2 rounded-sm border border-slate-400 p-2 leading-none"
      :class="modelValue ? 'bg-ink-200 hover:bg-ink-100' : 'border-dashed hover:bg-ink-200'"
    >
      <div
        class="flex cursor-pointer items-center space-x-2 overflow-hidden overflow-ellipsis text-sm"
        @click="modelValue = modelValue ? null : true"
      >
        <z-icon icon="autofix" size="small" :color="!modelValue ? 'vanilla-400' : 'vanilla-100'" />
        <span
          class="truncate text-xs"
          :class="modelValue ? 'text-vanilla-100' : 'text-vanilla-300'"
        >
          Filter by Autofix
        </span>
        <z-icon
          icon="plus"
          size="small"
          color="vanilla-400"
          class="transform duration-75"
          :class="{
            'rotate-45': modelValue
          }"
        />
      </div>
    </div>
  </z-badge>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ModelSync } from 'vue-property-decorator'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

@Component({})
export default class AutofixAvailable extends mixins(RepoDetailMixin) {
  @ModelSync('autofixAvailable', 'toggleAutofix', { type: Boolean, default: false })
  readonly modelValue: boolean

  get autofixableIssuesCount(): number {
    return this.repository.autofixableIssuesMetadata?.autofixableIssueCount || 0
  }
}
</script>
