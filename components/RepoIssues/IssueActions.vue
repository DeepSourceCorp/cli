<template>
  <div class="flex items-center space-x-2 justify-end flex-auto">
    <!-- Autofix -->
    <z-button
      v-if="issue.autofixAvailable"
      buttonType="primary"
      size="small"
      custom-classes="hidden xl:flex items-center space-x-2"
      :disabled="!canCreateAutofix"
      @click.prevent="openModal('autofix')"
    >
      <z-icon icon="autofix" size="small" color="ink-300"></z-icon>
      <span>Autofix</span>
    </z-button>

    <!-- Ignore issue actions -->
    <z-menu v-if="canIgnoreIssues" direction="left" width="40" class="text-vanilla-100">
      <template slot="trigger">
        <z-button buttonType="secondary" size="small" icon="slash" class="hidden sm:flex"
          >Ignore this issue</z-button
        >
        <z-button buttonType="secondary" size="small" icon="slash" class="sm:hidden"></z-button>
      </template>
      <template slot="body" class="text-vanilla-200">
        <z-menu-item
          v-for="filter in ignoreIssues"
          v-bind:key="filter.name"
          @click="() => openModal(filter.name)"
        >
          {{ filter.label }}
        </z-menu-item>
      </template>
    </z-menu>
    <ignore-issue-all-files
      v-if="currentComponent === 'all-files'"
      :isOpen="isOpen"
      :checkId="checkId"
      :shortcode="shortcode"
      @close="close"
      @ignore="markAllOccurrenceDisabled"
    ></ignore-issue-all-files>
    <ignore-issue-test-files
      v-if="currentComponent === 'test-files'"
      :isOpen="isOpen"
      :checkId="checkId"
      :shortcode="shortcode"
      @close="close"
      @ignore="markAllOccurrenceDisabled"
    ></ignore-issue-test-files>
    <ignore-issue-file-pattern
      v-if="currentComponent === 'file-pattern'"
      :isOpen="isOpen"
      :checkId="checkId"
      :shortcode="shortcode"
      @close="close"
      @ignore="markAllOccurrenceDisabled"
    ></ignore-issue-file-pattern>
    <autofix-file-chooser
      v-if="currentComponent === 'autofix'"
      :isOpen="isOpen"
      :issueId="issue.id"
      :repositoryId="repository.id"
      :shortcode="issue.shortcode"
      :raisedInFiles="issue.raisedInFiles"
      @close="close"
    ></autofix-file-chooser>

    <!-- Create issue on VCS -->
    <z-button
      v-if="issue.newVcsIssueUrl"
      :to="issue.newVcsIssueUrl"
      target="_blank"
      rel="noopener noreferrer"
      buttonType="secondary"
      icon="github"
      size="small"
      class="hidden sm:flex"
    >
      Create issue on GitHub
    </z-button>
    <z-button
      v-if="issue.newVcsIssueUrl"
      :to="issue.newVcsIssueUrl"
      target="_blank"
      rel="noopener noreferrer"
      buttonType="secondary"
      icon="github"
      size="small"
      class="sm:hidden"
    ></z-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZMenu, ZMenuItem, ZModal } from '@deepsourcelabs/zeal'
import { RepositoryIssue, Repository } from '~/types/types'
import { AutofixFileChooser } from '@/components/RepoIssues'
import {
  IgnoreIssueTestFiles,
  IgnoreIssueAllFiles,
  IgnoreIssueFilePattern
} from '@/components/RepoIssues/index'

import RoleAccessMixin from '~/mixins/roleAccessMixin'

@Component({
  components: {
    ZIcon,
    ZButton,
    ZMenu,
    ZMenuItem,
    ZModal,
    IgnoreIssueTestFiles,
    IgnoreIssueAllFiles,
    IgnoreIssueFilePattern,
    AutofixFileChooser
  }
})
export default class IssueActions extends mixins(RoleAccessMixin) {
  @Prop()
  issue!: RepositoryIssue

  @Prop({ default: true })
  canCreateAutofix!: boolean

  @Prop()
  repository!: Repository

  @Prop()
  checkId: string

  @Prop()
  shortcode: string

  public isOpen = false

  public currentComponent = ''

  public ignoreIssues: Array<Record<string, string | boolean>> = [
    { label: 'For a file pattern', name: 'file-pattern', isActive: false },
    { label: 'For all test files', name: 'test-files', isActive: false },
    { label: 'For all files', name: 'all-files', isActive: false }
  ]

  public close(): void {
    this.isOpen = false
  }

  public openModal(name: string): void {
    this.currentComponent = name
    this.isOpen = true
  }

  get canIgnoreIssues() {
    return this.repoPerms.canIgnoreIssues
  }

  public markAllOccurrenceDisabled(issueIds: string[]): void {
    this.$emit('ignoreIssues', issueIds)
    this.close()
  }
}
</script>
