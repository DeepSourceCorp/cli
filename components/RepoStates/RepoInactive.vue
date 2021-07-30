<template>
  <base-state :title="noticeTitle">
    <template slot="hero">
      <div class="text-4xl text-center mb-4">⚙️</div>
    </template>
    <div
      v-if="(repository.canBeActivated || repository.isActivated) && canActivateRepo"
      class="grid gris-cols-1 sm:grid-cols-2 max-w-4xl mt-5 divide-y sm:divide-y-0 sm:divide-x divide-ink-300"
    >
      <div class="px-5">
        <h3 class="text-lg font-bold text-vanilla-200">Need help with the config?</h3>
        <p class="mt-2">
          Use the generator to easily customize and create a
          <strong class="text-vanilla-200">.deepsource.toml</strong> file for this repository.
        </p>
        <nuxt-link :to="$generateRoute(['generate-config'])">
          <z-button icon="settings" size="small" class="mt-4">Generate Config</z-button>
        </nuxt-link>
      </div>
      <div class="px-5">
        <h3 class="text-lg font-bold text-vanilla-200">Already added the config?</h3>
        <p class="mt-2">
          Ensure that you've added the configuration in the repository's root folder, and committed
          it to the <strong class="text-vanilla-200">{{ defaultBranchName }}</strong> branch.
        </p>
        <z-button
          v-if="!activateLoading"
          @click="activateAnalysis"
          icon="check-circle"
          size="small"
          class="mt-4"
        >
          Activate Repository
        </z-button>
        <z-button v-else size="small" class="mt-4">
          <z-icon class="animate-spin" icon="spin-loader" color="ink"></z-icon>
          <span>Activating Repository</span>
        </z-button>
      </div>
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
  </base-state>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import { BaseState } from '.'

import { Repository, TeamMemberRoleChoices } from '~/types/types'
import { TeamPerms } from '~/types/permTypes'

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
    return this.$gateKeeper.team(TeamPerms.ACTIVATE_ANALYSIS, role)
  }

  async activateAnalysis(): Promise<void> {
    this.activateLoading = true
    await this.toggleRepoActivation({
      isActivated: true,
      id: this.id
    })
    this.activateLoading = false
    this.$toast.success(`Successfully activated ${this.name}`)
    this.$emit('refetch')
  }
}
</script>
