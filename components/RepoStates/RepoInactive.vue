<template>
  <base-state :title="noticeTitle">
    <template slot="hero">
      <img
        class="mx-auto mb-4"
        :src="require('~/assets/images/ui-states/repo/inactive.svg')"
        alt="Repo Inactive"
      />
    </template>
    <p>
      This repository is not activated, generate a new config or activate the repository directly if
      a <code class="text-vanilla-200 font-medium">.deepsource.toml</code> already exists.
    </p>
    <div
      v-if="(repository.canBeActivated || repository.isActivated) && canActivateRepo"
      class="flex items-center space-x-5 justify-center"
    >
      <nuxt-link :to="$generateRoute(['generate-config'])">
        <z-button icon="settings" size="small" button-type="secondary" class="mt-4"
          >Generate config</z-button
        >
      </nuxt-link>

      <z-button
        v-if="!activateLoading"
        @click="activateAnalysis"
        icon="check-circle"
        size="small"
        class="mt-4"
      >
        Activate repository
      </z-button>
      <z-button v-else size="small" class="mt-4">
        <z-icon class="animate-spin" icon="spin-loader" color="ink"></z-icon>
        <span>Activating Repository</span>
      </z-button>
    </div>
    <div v-else-if="canViewerUpgrade">
      <p class="mt-2 max-w-xl">
        You have reached the limit for the number of private repositories you can activate on this
        account, upgrade plan to activate this repository.
      </p>
      <nuxt-link
        class="block"
        :to="['', $route.params.provider, $route.params.owner, 'settings', 'billing'].join('/')"
      >
        <z-button icon="arrow-up" size="small" class="mt-4"> Upgrade Plan </z-button>
      </nuxt-link>
    </div>
    <div v-else-if="canRequestRepoActivation">
      <p class="mt-2 max-w-xl">
        Please get in touch with the owner of your organization to activate analysis for this
        repository.
      </p>
    </div>
  </base-state>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import { BaseState } from '.'

import { Repository, TeamMemberRoleChoices } from '~/types/types'
import { RepoPerms, TeamPerms } from '~/types/permTypes'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

@Component({
  components: {
    BaseState,
    ZButton,
    ZIcon
  }
})
export default class RepoInactive extends mixins(RepoDetailMixin, RoleAccessMixin) {
  @Prop()
  id: Repository['id']

  @Prop()
  name: Repository['name']

  @Prop()
  defaultBranchName: Repository['defaultBranchName']

  activateLoading = false

  get canViewerUpgrade(): boolean {
    return this.$gateKeeper.team(TeamPerms.CHANGE_PLAN, this.teamPerms.permission)
  }

  get noticeTitle(): string {
    if (!this.canActivateRepo) {
      return 'This repository is not activated'
    }

    if (this.repository.canBeActivated || this.repository.isActivated) {
      return 'Activate analysis on this repository'
    }

    if (this.canViewerUpgrade) {
      return 'Upgrade to activate this repository'
    }

    return 'Repository cannot be activated'
  }

  get canActivateRepo(): boolean {
    const role = this.activeDashboardContext.role as TeamMemberRoleChoices
    return (
      this.$gateKeeper.team(TeamPerms.ACTIVATE_ANALYSIS, role) ||
      this.$gateKeeper.repo(RepoPerms.ACTIVATE_REPOSITORY, this.repoPerms.permission)
    )
  }

  get canRequestRepoActivation(): boolean {
    return this.$gateKeeper.repo(RepoPerms.READ_REPO, this.repoPerms.permission)
  }

  async activateAnalysis(): Promise<void> {
    this.activateLoading = true
    await this.toggleRepoActivation({
      isActivated: true,
      id: this.id
    })
    this.activateLoading = false
    this.$emit('refetch')
  }
}
</script>
