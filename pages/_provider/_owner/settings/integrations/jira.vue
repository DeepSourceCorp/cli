<template>
  <div>
    <div class="p-4 border-b border-ink-200">
      <z-breadcrumb separator="/" class="mb-px text-sm text-vanilla-100">
        <z-breadcrumb-item class="cursor-pointer text-vanilla-400">
          <nuxt-link :to="$generateRoute(['settings', 'integrations'])">Integrations</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item>Jira</z-breadcrumb-item>
      </z-breadcrumb>
    </div>

    <div class="max-w-2xl p-4 pb-32">
      <div class="flex justify-between" :class="{ 'mb-4': !hasIntegrationEnabled }">
        <div class="inline-flex items-center grid-x-2">
          <div class="p-1 bg-ink-300">
            <img :src="logoUrl" alt="Jira" class="flex-shrink-0 w-5 h-5" />
          </div>
          <h2 class="font-medium leading-10 text-vanilla-100" style="font-size: 18px">Jira</h2>
        </div>

        <notice v-if="hasIntegrationEnabled" class="h-8">
          <p class="text-xs">
            Installed on <span class="font-medium text-vanilla-100">deepsourcehq.jira.com</span>
          </p>
        </notice>
        <z-button
          v-else
          icon="arrow-up-right"
          label="Jira Marketplace"
          size="small"
          @click="hasIntegrationEnabled = true"
        />
      </div>

      <z-divider v-if="hasIntegrationEnabled" margin="my-4" />

      <div
        v-if="hasIntegrationEnabled"
        class="flex items-center text-xs grid-x-1 text-vanilla-400 mb-7"
      >
        <span>Installed by</span>
        <z-avatar
          image="https://dev-asgard-static.s3.us-east-1.amazonaws.com/dashboard/images/empty-avatar.svg"
          user-name="Sanket Saurav"
          size="xs"
          class="flex-shrink-0 leading-none rounded-full"
        />
        <span class="text-xs font-medium leading-none text-vanilla-100">Sanket Saurav</span>
        <span>on Aug 19</span>
      </div>

      <z-alert type="neutral" :dismissible="true">
        <div class="space-y-2">
          <h2 class="text-sm font-medium text-vanilla-100">How does it work?</h2>
          <p class="text-xs leading-relaxed text-vanilla-400">
            Create new Jira issues from DeepSource-detected issues on your codebase and link
            DeepSource-detected issues to your existing Jira issues.
          </p>
        </div>
      </z-alert>

      <div v-if="!hasIntegrationEnabled">
        <z-divider />

        <p class="text-xs text-vanilla-400">Not enabled</p>
      </div>

      <div v-if="hasIntegrationEnabled" class="flex justify-between mt-6">
        <div class="max-w-xs space-y-1.5">
          <h5 class="text-sm text-vanilla-300">Default project</h5>
          <p class="text-xs text-vanilla-400">
            Issues would be created under the default project unless specified in repo settings.
          </p>
        </div>

        <div class="h-8 w-60">
          <z-select class="text-sm w-60" spacing="pl-3" placeholder="Integration Test">
            <z-option label="Project name" value="project name" class="pl-3" />
          </z-select>
        </div>
      </div>

      <div v-if="hasIntegrationEnabled" class="flex justify-between mt-9">
        <div class="max-w-xs space-y-1.5">
          <h5 class="text-sm text-vanilla-300">Default Issue type</h5>
          <p class="text-xs text-vanilla-400">
            Issues would be created under the default issue type unless specified in repo settings.
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

      <z-divider v-if="hasIntegrationEnabled" margin="my-4" />

      <div v-if="hasIntegrationEnabled" class="flex justify-between">
        <div class="max-w-xs space-y-1.5">
          <h5 class="text-sm text-vanilla-300">Remove integration</h5>
          <p class="text-xs text-vanilla-400">
            Removing the Jira integration from your account would stop letting you create issues to
            your Jira instance.
          </p>
        </div>

        <div class="h-8 bg-cherry hover:bg-opacity-80">
          <z-button
            button-type="ghost"
            color="ink-300"
            icon="x"
            size="small"
            class="bg-cherry hover:bg-opacity-0"
            @click="hasIntegrationEnabled = false"
            >Remove Jira</z-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ZAlert,
  ZAvatar,
  ZBreadcrumb,
  ZBreadcrumbItem,
  ZButton,
  ZDivider,
  ZIcon,
  ZOption,
  ZSelect,
  ZTextarea
} from '@deepsourcelabs/zeal'
import { Component } from 'nuxt-property-decorator'
import Vue from 'vue'

import { TeamPerms } from '~/types/permTypes'

/**
 * Owner-level integrations page specific to an app
 */
@Component({
  components: {
    ZAlert,
    ZAvatar,
    ZButton,
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZDivider,
    ZIcon,
    ZOption,
    ZSelect,
    ZTextarea
  },
  middleware: ['perm', 'teamOnly'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_INTEGRATIONS]
    }
  },
  layout: 'dashboard'
})
export default class JiraIntegration extends Vue {
  automaticallyCreateIssues = false
  hasIntegrationEnabled = false
  isAlertVisible = true

  ignoredFields = ''
  logoUrl =
    'https://user-images.githubusercontent.com/87924230/152784392-0ec076ef-9283-47a8-94fc-6f19d832366b.svg'
}
</script>
