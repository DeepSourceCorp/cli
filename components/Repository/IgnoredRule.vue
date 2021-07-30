<template>
  <div
    class="flex items-center"
    :class="{
      'opacity-50 pointer-events-none': isDeleted,
      'opacity-100 pointer-events-auto': !isDeleted
    }"
  >
    <div class="flex-1 flex flex-col space-y-2 text-sm">
      <div class="flex space-x-2 w-full">
        <div
          class="flex-1"
          :class="{
            'line-through': isDeleted
          }"
        >
          <span v-if="rule.issue" class="font-bold">{{ rule.issue.shortcode }}</span>
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
        </div>
        <button
          v-tooltip="'Delete this rule'"
          v-if="allowDelete"
          class="h-6 w-6 grid place-content-center rounded-md hover:bg-ink-300"
          @click="openDeleteRuleModal()"
        >
          <z-icon icon="trash-2" color="cherry" size="small"></z-icon>
        </button>
      </div>
      <div class="flex space-x-4 text-xs">
        <span class="flex items-center space-x-1">
          <img
            :src="rule.creator.avatar"
            alt="Creator Avatar"
            class="w-4 h-4 overflow-hidden inline-block rounded-full"
          />
          <span class="text-vanilla-400">{{ rule.creator.email }}</span>
        </span>
        <span class="flex items-center space-x-2 leading-none">
          <z-icon icon="clock" color="vanilla-400" size="small"></z-icon>
          <span class="text-vanilla-400">Added {{ ruleCreatedTime(rule.createdAt) }}</span>
        </span>
      </div>
      <ignored-rule-delete-modal
        :isOpen="isDeleteModalOpen"
        :silenceRuleId="rule.id"
        @close="closeDeleteModal"
        @delete="deleteRule()"
      ></ignored-rule-delete-modal>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { SilenceRule } from '~/types/types'
import { fromNow } from '~/utils/date'
import { IgnoredRuleDeleteModal } from '@/components/Settings/index'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

@Component({
  components: {
    ZIcon,
    IgnoredRuleDeleteModal
  }
})
export default class IgnoredRule extends mixins(RepoDetailMixin, RoleAccessMixin) {
  @Prop()
  rule!: SilenceRule

  public isDeleteModalOpen = false

  public isDeleted = false

  public openDeleteRuleModal(): void {
    this.isDeleteModalOpen = true
  }

  public closeDeleteModal(): void {
    this.isDeleteModalOpen = false
  }

  get allowDelete(): boolean {
    return this.loggedIn
  }

  public ruleCreatedTime(created: string): string {
    return fromNow(created)
  }

  public async deleteRule(): Promise<void> {
    await this.deleteIgnoredRule({
      silenceRuleId: this.rule.id
    })
    this.isDeleted = true
  }
}
</script>
