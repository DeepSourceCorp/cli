<template>
  <div class="p-4 space-y-4">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      <recently-active-repo-list
        :class="
          steps.length && completion < 100
            ? 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5'
            : 'col-span-full'
        "
      ></recently-active-repo-list>
      <template v-if="steps.length && completion < 100 && allowAccountSetupCard">
        <account-setup-card :completion="completion" />
      </template>
    </div>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <owner-issues-graph :full-width="!showAutofixGraph" />
      <owner-autofix-graph v-if="showAutofixGraph" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { RecentlyActiveRepoList, AccountSetupCard } from '@/components/TeamHome'

import { OwnerIssuesGraph, OwnerAutofixGraph } from '@/components/Graphs'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import { AppFeatures, TeamPerms } from '~/types/permTypes'

interface SetupStep {
  completed: boolean
  shortcode: string
  display_name: string
  description: string
  link?: string
  actionLabel?: string
}

@Component({
  components: {
    RecentlyActiveRepoList,
    AccountSetupCard,
    OwnerIssuesGraph,
    OwnerAutofixGraph
  },
  middleware: ['validateProvider', 'perm'],
  meta: {
    auth: {
      teamPerms: [TeamPerms.VIEW_TEAM_HOME]
    }
  },
  layout: 'dashboard'
})
export default class TeamHome extends mixins(OwnerDetailMixin, ActiveUserMixin) {
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchAccountSetupStatus({
      login: owner,
      provider
    })
  }

  head(): Record<string, string> {
    return {
      title: `DeepSource`
    }
  }

  /**
   * Mounted hook
   *
   * @return {void}
   */
  mounted(): void {
    const { owner, provider } = this.$route.params
    this.setActiveContextCookie(provider, owner)
  }

  get allowAccountSetupCard(): boolean {
    const context = this.activeDashboardContext as DashboardContext
    return ['ADMIN', 'MEMBER'].includes(context.role)
  }

  get showAutofixGraph(): boolean {
    const { provider } = this.$route.params
    return this.$gateKeeper.provider(AppFeatures.AUTOFIX, provider)
  }

  get steps(): Array<SetupStep> {
    return (this.owner.accountSetupStatus as Array<SetupStep>).map((step) => {
      return step as SetupStep
    })
  }

  get completion(): number {
    const completed = this.steps.filter((step) => step.completed).length
    return Math.round((completed / this.steps.length) * 100)
  }
}
</script>
