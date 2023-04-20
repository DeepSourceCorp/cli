<template>
  <base-card :remove-default-style="true" :custom-padding="verticalPadding">
    <template #title>
      <p class="text-sm font-normal">
        <nuxt-link
          v-if="rule.issue"
          :to="`/directory/analyzers/${rule.issue.analyzer.shortcode}/issues/${rule.issue.shortcode}`"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="font-bold text-juniper hover:underline">{{ rule.issue.shortcode }}</span>
        </nuxt-link>
        <span>Ignored</span>
        <span v-if="rule.metadata.type === 'pattern'"> for all files matching with pattern </span>
        <span v-else-if="rule.metadata.type === 'test-pattern'">
          for all test files in the repository
        </span>
        <span v-else-if="rule.metadata.type === 'forever'">
          <span v-if="rule.silenceLevel === 'FL'"> for file </span>
          <span v-else> for all files in this repository </span>
        </span>
        <span class="font-semibold text-vanilla-100">{{
          rule.metadata.glob_pattern || rule.filePath
        }}</span>
      </p>
    </template>

    <template #description>
      <div class="flex text-xs gap-x-4">
        <span class="flex items-center gap-x-1">
          <img
            :src="rule.creator.avatar"
            alt="Creator Avatar"
            class="inline-block w-4 h-4 overflow-hidden rounded-full"
          />
          <span class="text-vanilla-400">{{ rule.creator.email }}</span>
        </span>
        <span class="flex items-center leading-none gap-x-2">
          <z-icon icon="clock" color="vanilla-400" size="small" />
          <span class="text-vanilla-400">Added {{ ruleCreatedTime }}</span>
        </span>
      </div>
    </template>

    <template v-if="allowDelete" #info>
      <div class="flex justify-end h-full mt-1">
        <z-button
          v-tooltip="'Delete this rule'"
          size="small"
          button-type="ghost"
          icon="trash-2"
          color="cherry"
          @click="$emit('delete-rule-triggered', rule.id)"
        />
      </div>
    </template>
  </base-card>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsource/zeal'
import { SilenceRule } from '~/types/types'
import { fromNow } from '~/utils/date'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

@Component({
  components: {
    ZIcon,
    ZButton
  }
})
export default class IgnoredRule extends mixins(RoleAccessMixin) {
  @Prop()
  rule!: SilenceRule

  @Prop({ default: 'py-4' })
  verticalPadding: string

  get allowDelete(): boolean {
    return this.loggedIn && this.repoPerms.canIgnoreIssues
  }

  get ruleCreatedTime(): string {
    return fromNow(this.rule.createdAt)
  }
}
</script>
