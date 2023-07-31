<template>
  <base-state :title="noticeTitle">
    <template #hero>
      <img
        :src="require('~/assets/images/ui-states/repo/inactive.svg')"
        alt="Repo Inactive"
        class="mx-auto mb-4"
      />
    </template>

    <p>
      This repository is not activated, generate a new config or activate the repository directly if
      a <code class="font-medium text-vanilla-200">.deepsource.toml</code> already exists.
    </p>

    <div
      v-if="(repository.canBeActivated || repository.isActivated) && canActivateRepo"
      class="flex items-center justify-center space-x-5"
    >
      <nuxt-link :to="$generateRoute(['generate-config'])">
        <z-button icon="settings" size="small" button-type="secondary" class="mt-4"
          >Generate config</z-button
        >
      </nuxt-link>

      <z-button
        v-if="!configNotAdded"
        :disabled="activateAnalysisLoading"
        :is-loading="activateAnalysisLoading"
        loading-label="Activating Repository"
        icon="check-circle"
        size="small"
        class="mt-4"
        @click="$emit('activate-analysis')"
      >
        Activate repository
      </z-button>
    </div>

    <div v-else-if="canViewerUpgrade">
      <p class="mt-2 max-w-xl">
        You have reached the limit for the number of private repositories you can activate on this
        account, upgrade plan to activate this repository.
      </p>

      <nuxt-link
        :to="['', $route.params.provider, $route.params.owner, 'settings', 'billing'].join('/')"
        class="block"
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
import { ZButton } from '@deepsource/zeal'
import { Component, mixins, Prop } from 'nuxt-property-decorator'

import { RepoPerms, TeamPerms } from '~/types/permTypes'
import { Repository, TeamMemberRoleChoices } from '~/types/types'

import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

@Component({
  name: 'RepoInactive',
  components: {
    ZButton
  }
})
export default class RepoInactive extends mixins(RepoDetailMixin, RoleAccessMixin) {
  @Prop()
  defaultBranchName: Repository['defaultBranchName']

  @Prop()
  id: Repository['id']

  @Prop()
  name: Repository['name']

  @Prop({ default: false })
  activateAnalysisLoading: boolean

  get canViewerUpgrade(): boolean {
    return this.$gateKeeper.team(TeamPerms.CHANGE_PLAN, this.teamPerms.permission)
  }

  get configNotAdded(): boolean {
    return this.repository.errorCode === 3001
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
}
</script>
