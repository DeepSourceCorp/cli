<template>
  <div>
    <div class="max-w-2xl p-4 pb-32">
      <div class="flex justify-between">
        <div class="inline-flex items-center space-x-2">
          <div class="p-1 bg-ink-300">
            <img :src="logoUrl" alt="Slack logo" class="flex-shrink-0 w-5 h-5" />
          </div>
          <h2 class="font-medium leading-10 text-vanilla-100" style="font-size: 18px">Jira</h2>
        </div>

        <notice class="h-8">
          <p class="text-xs">
            Installed on <span class="font-medium text-vanilla-100">deepsourcehq.jira.com</span>
          </p>
        </notice>
      </div>

      <div class="flex justify-between mt-6">
        <div class="max-w-xs space-y-1.5">
          <h5 class="text-sm text-vanilla-300">Project</h5>
          <p class="text-xs text-vanilla-400">
            Add issues from `account-renewal-process-new` to a new project.
          </p>
        </div>

        <div class="h-8 w-60">
          <z-select class="text-sm w-60" spacing="pl-3" placeholder="Integration Test">
            <z-option label="Project name" value="project name" class="pl-3" />
          </z-select>
        </div>
      </div>

      <div class="flex justify-between mt-9">
        <div class="max-w-xs space-y-1.5">
          <h5 class="text-sm text-vanilla-300">Issue type</h5>
          <p class="text-xs text-vanilla-400">
            Add issues from `account-renewal-process-new` to a specific issue type.
          </p>
        </div>

        <div class="h-8 w-60">
          <z-select class="text-sm w-60" spacing="pl-3" placeholder="Improvement">
            <template #icon>
              <z-icon icon="arrow-up-circle" />
            </template>
            <z-option label="Issue type" value="issue type" class="pl-3" />
          </z-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ZIcon, ZOption, ZSelect } from '@deepsourcelabs/zeal'
import { Component } from 'nuxt-property-decorator'
import Vue from 'vue'
import { RepoPerms } from '~/types/permTypes'

/**
 * Repository level integrations page for Jira
 */
@Component({
  components: {
    ZIcon,
    ZOption,
    ZSelect
  },
  middleware: ['perm', 'teamOnly'],
  meta: {
    strict: true,
    repoPerms: [RepoPerms.CHANGE_INTEGRATION_SETTINGS]
  },
  layout: 'dashboard'
})
export default class RepoLevelJiraIntegrationPage extends Vue {
  logoUrl =
    'https://user-images.githubusercontent.com/87924230/152784392-0ec076ef-9283-47a8-94fc-6f19d832366b.svg'
}
</script>
