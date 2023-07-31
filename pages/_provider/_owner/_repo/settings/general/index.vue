<template>
  <div class="flex max-w-2xl flex-col gap-y-2 p-4">
    <!-- title -->
    <div class="text-lg font-medium text-vanilla-100">General</div>

    <form-group :divide="false">
      <!-- Default Analysis Branch -->
      <template v-if="!isMonorepo">
        <div class="grid gap-4 py-4 lg:hidden">
          <div class="col-span-full md:col-auto">
            <label for="team-settings-branch" class="text-sm text-vanilla-100">
              Default analysis branch
            </label>

            <div class="mt-2">
              <z-input
                id="team-settings-branch"
                v-model="branch"
                class="px-2"
                size="small"
                @blur="updateBranch"
              />
            </div>
          </div>
          <p class="max-w-sm text-xs leading-5 text-vanilla-400">
            This is the base branch for analysis by DeepSource. Your issues tab will be populated
            with the issues found on this branch.
          </p>
        </div>

        <text-input
          v-model="branch"
          input-width="x-small"
          label="Default analysis branch"
          input-id="team-settings-branch"
          :cascade-input="true"
          class="hidden max-w-2xl flex-grow lg:grid"
          @blur="updateBranch"
        >
          <template #description>
            <p class="max-w-sm">
              This is the base branch for analysis by DeepSource. Your issues tab will be populated
              with the issues found on this branch.
            </p>
          </template>
        </text-input>
      </template>

      <!-- Hide the border on top for Monorepos since it's just the title that appears above -->
      <toggle-input
        v-if="!isSubRepository"
        v-model="enableGitMod"
        input-width="x-small"
        label="Enable git submodules"
        input-id="enable-git-submodules"
        class="max-w-2xl"
        :class="{ 'border-t border-slate-400': !isMonorepo }"
        @input="updateRepositorySettings"
      >
        <template #description>
          <p class="max-w-sm">
            If you are using private submodules, ensure that DeepSource has access to them via an
            <nuxt-link
              :to="$generateRoute(['settings', 'ssh-access'])"
              class="font-medium text-juniper"
              >SSH key</nuxt-link
            >.
          </p>
        </template>
      </toggle-input>
    </form-group>

    <template v-if="!isMonorepo">
      <form-group label="Analysis settings" class="max-w-2xl">
        <!-- needed custom markup for mobile view cause we're rearranging order of title, description & z-select -->
        <section>
          <div class="grid gap-4 py-4 lg:hidden">
            <div class="col-span-full md:col-auto">
              <label for="repo-setting-analysis-scope" class="text-sm text-vanilla-100">
                Analysis scope
              </label>

              <div class="mt-2 h-8">
                <z-select
                  v-if="selectedScope"
                  v-model="selectedScope"
                  spacing="py-1 px-2"
                  class="text-sm"
                >
                  <z-option label="Granular (recommended)" value="granular" />
                  <z-option label="Broad" value="broad" />
                </z-select>
              </div>
            </div>
            <ul class="ml-4 max-w-sm list-outside list-disc text-xs leading-5 text-vanilla-400">
              <li>
                <span class="relative -left-1">
                  If <b>Granular</b> is selected, issues would be reported only for lines that have
                  been added or modified across all the files affected.
                </span>
              </li>
              <li class="mt-1.5">
                <span class="relative -left-1">
                  If <b>Broad</b> is selected, all issues will be reported in files that have been
                  updated or added, beware, this can be noisy.
                </span>
              </li>
            </ul>
          </div>

          <input-wrapper
            input-id="repo-analysis-scope"
            label="Analysis scope"
            input-width="x-small"
            class="hidden lg:grid"
          >
            <div class="h-8">
              <z-select
                v-if="selectedScope"
                v-model="selectedScope"
                spacing="py-1 px-2"
                class="text-sm"
              >
                <z-option label="Granular (recommended)" value="granular" />
                <z-option label="Broad" value="broad" />
              </z-select>
            </div>

            <template #description>
              <ul class="ml-4 max-w-sm list-outside list-disc">
                <li>
                  If <b>Granular</b> is selected, issues would be reported only for lines that have
                  been added or modified across all the files affected.
                </li>
                <li class="mt-1.5">
                  If <b>Broad</b> is selected, all issues will be reported in files that have been
                  updated or added, beware, this can be noisy.
                </li>
              </ul>
            </template>
          </input-wrapper>
        </section>

        <button-input
          label="Analysis configuration"
          input-id="repo-settings-analysis-config"
          button-label="Generate configuration"
          :to="$generateRoute(['generate-config'])"
          :full-width="true"
          input-width="x-small"
        >
          <template #description>
            <p class="max-w-sm">
              Change the deepsource.toml file in the repository's root to modify the analysis
              configuration.
            </p>
          </template>
        </button-input>
        <button-input
          v-if="canActivateRepo"
          label="Analysis status"
          input-id="repo-settings-analysis-status"
          input-width="x-small"
          :full-width="true"
        >
          <button
            id="repo-settings-analysis-status"
            class="flex h-10 w-full items-center justify-center space-x-2 self-end rounded-sm px-4 py-1 font-medium transition-all duration-150 ease-in-out md:-ml-4 md:h-8 md:w-52"
            :class="{
              'border border-cherry bg-transparent text-cherry': isRepoActivated && isHovered,
              'border border-juniper bg-transparent text-juniper': !isRepoActivated && isHovered,
              'bg-cherry text-vanilla-100': !isRepoActivated && !isHovered,
              'bg-juniper text-ink-400': isRepoActivated && !isHovered
            }"
            @click="toggleState"
            @mouseenter="updateHoverStyle(true)"
            @mouseleave="updateHoverStyle(false)"
          >
            <z-icon :icon="icon" size="small" color="current" />
            <span class="text-sm leading-none">{{ buttonText }}</span>
          </button>

          <template #description>
            <p class="max-w-sm">
              Careful! DeepSource will stop monitoring changes to your code if analysis is
              deactivated
            </p>
          </template>
        </button-input>
      </form-group>

      <form-group
        v-if="!$config.onPrem && !repository.isPrivate"
        label="Discover settings"
        class="max-w-2xl"
      >
        <button-input
          label="Add to discover"
          input-id="add-to-discover"
          :full-width="true"
          :button-label="repository.showInDiscover ? 'Remove your project' : 'Add your project'"
          input-width="x-small"
          @click="updateDiscoverFeedPreference"
        >
          <template #description>
            <p class="max-w-sm">
              Add your repository to
              <nuxt-link to="/discover" class="font-medium text-juniper">Discover</nuxt-link> to
              allow others to find issues and fix them.
            </p>
          </template>
        </button-input>
      </form-group>
    </template>

    <form-group
      v-if="showMonorepoSection"
      :divide="false"
      label="Monorepo settings"
      class="max-w-2xl"
    >
      <button-input :full-width="true" input-id="toggle-monorepo-mode" label="Monorepo mode">
        <z-button
          :is-loading="togglingMonorepoMode"
          :disabled="togglingMonorepoMode"
          :button-type="isMonorepo ? 'secondary' : 'primary'"
          size="small"
          icon="arrow-left-right"
          class="'h-10 md:h-8'"
          @click="showToggleMonorepoConfirm = true"
        >
          {{ isMonorepo ? 'Disable monorepo mode' : 'Convert to monorepo' }}
        </z-button>
        <template #description>
          <p class="max-w-sm">
            Enabling this allows you to individually configure analyses for distinct modules in your
            repository.
          </p>
        </template>
      </button-input>

      <div
        class="flex items-center gap-x-2 rounded-md bg-opacity-10 px-2.5 py-1.5 text-xs"
        :class="isMonorepo ? 'bg-juniper text-juniper-300' : 'bg-robin text-robin-400'"
      >
        <span
          class="h-1.5 w-1.5 flex-shrink-0 rounded-full"
          :class="isMonorepo ? 'bg-juniper-500' : 'bg-robin-500'"
        ></span>
        <span class="leading-6"
          >Monorepo mode is {{ !isMonorepo ? 'not' : '' }} enabled for this repository.</span
        >
      </div>
    </form-group>

    <portal to="modal">
      <toggle-monorepo-confirm
        v-if="showToggleMonorepoConfirm"
        :is-monorepo="isMonorepo"
        :repo-name="baseRouteParams.name"
        :team-name="baseRouteParams.owner"
        :toggling-monorepo-mode="togglingMonorepoMode"
        @close="showToggleMonorepoConfirm = false"
        @toggle-monorepo="toggleMonorepoMode"
      />
    </portal>
  </div>
</template>

<script lang="ts">
import { ZButton, ZDivider, ZIcon, ZInput, ZOption, ZSelect, ZToggle } from '@deepsource/zeal'
import { Component, mixins, Watch } from 'nuxt-property-decorator'

import { AppFeatures, RepoPerms, TeamPerms } from '~/types/permTypes'
import { Maybe, RepositoryKindChoices, TeamMemberRoleChoices } from '~/types/types'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { OwnerFeatureType } from '~/types/ownerTypes'

@Component({
  components: {
    ZInput,
    ZDivider,
    ZToggle,
    ZButton,
    ZSelect,
    ZOption,
    ZIcon
  },
  layout: 'repository',
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [
        RepoPerms.CHANGE_DEFAULT_ANALYSIS_BRANCH,

        RepoPerms.DEACTIVATE_ANALYSIS_ON_REPOSITORY
      ]
    }
  }
})
export default class General extends mixins(
  ActiveUserMixin,
  RepoDetailMixin,
  RepoListMixin,
  RoleAccessMixin,
  OwnerDetailMixin
) {
  public branch: Maybe<string> | undefined = ''
  public enableGitMod = false
  public isActive = true

  public selectedScope = ''

  public scopes = [
    {
      value: 'granular',
      label: 'Granular (recommended)'
    },
    {
      value: 'broad',
      label: 'Broad'
    }
  ]

  public isRepoActivated = false
  public isFetchingData = true
  public isHovered = false
  public buttonStyle = ''

  public showToggleMonorepoConfirm = false
  public togglingMonorepoMode = false
  public monorepoFeatureAllowed = false

  get buttonText(): string {
    if (this.isHovered) {
      if (this.isRepoActivated) {
        return 'Deactivate analysis'
      }
      return 'Activate analysis'
    }
    if (this.isRepoActivated) {
      return 'Analysis active'
    }
    return 'Analysis deactivated'
  }

  get icon(): string {
    if (this.isHovered) {
      if (this.isRepoActivated) {
        return 'x'
      }
      return 'check-circle'
    }
    if (this.isRepoActivated) {
      return 'check-circle'
    }
    return 'x'
  }

  get canActivateRepo(): boolean {
    const role = this.activeDashboardContext.role as TeamMemberRoleChoices
    return this.$gateKeeper.team(TeamPerms.ACTIVATE_ANALYSIS, role)
  }

  get showMonorepoSection(): boolean {
    const { provider } = this.$route.params

    return (
      this.monorepoFeatureAllowed &&
      !this.isSubRepository &&
      this.$gateKeeper.provider(AppFeatures.MONOREPO, provider) &&
      this.$gateKeeper.repo(RepoPerms.TOGGLE_MONOREPO_MODE, this.repoPerms.permission)
    )
  }

  get isMonorepo(): boolean {
    return this.repository?.kind === RepositoryKindChoices.Monorepo
  }

  get isSubRepository(): boolean {
    return this.repository?.kind === RepositoryKindChoices.Subrepo
  }

  async fetch(): Promise<void> {
    this.isFetchingData = true

    await Promise.all([
      this.fetchRepoSettings(),
      this.repoPerms.permission ? Promise.resolve() : this.fetchRepoPerms(this.baseRouteParams),
      this.fetchOwnerFeatures()
    ])
    this.populateValue()

    this.isFetchingData = false
  }

  public async fetchRepoSettings() {
    await this.fetchRepositorySettingsGeneral({
      provider: this.$route.params.provider,
      owner: this.$route.params.owner,
      name: this.$route.params.repo
    })
  }

  async updateBranch(): Promise<void> {
    if (this.repository.defaultBranchName !== this.branch) {
      await this.updateRepositorySettings(false)
      this.$toast.show({
        type: 'success',
        message: 'Default branch has been updated successfully',
        timeout: 5
      })
    }
  }

  public async fetchOwnerFeatures() {
    try {
      this.monorepoFeatureAllowed = await this.$isFeatureAvailable(OwnerFeatureType.MONOREPO, {
        login: this.$route.params.owner,
        provider: this.$providerMetaMap[this.$route.params.provider].value
      })
    } catch (error) {
      this.$logErrorAndToast(
        error as Error,
        'Unable to fetch details about the team. Please contact support.'
      )
    }
  }

  @Watch('selectedScope')
  async updateScope(val: string, oldVal: string): Promise<void> {
    this.selectedScope = val
    if (val !== oldVal && oldVal !== '') {
      await this.updateRepositorySettings()
    }
  }

  public showSuccessToast() {
    this.$toast.show({
      type: 'success',
      message: 'Repository settings updated successfully',
      timeout: 5
    })
  }

  public async updateRepositorySettings(showSuccess = true): Promise<void> {
    if (this.repository?.id && !this.isFetchingData) {
      await this.updateRepoSettings({
        input: {
          id: this.repository.id,
          showInDiscover: this.repository.showInDiscover,
          defaultBranchName: this.branch,
          isSubmoduleEnabled: this.enableGitMod,
          analyzeChangesetOnly: this.selectedScope == 'granular' ? true : false,
          keepExistingIssues: true
        }
      })
      if (showSuccess) {
        this.showSuccessToast()
      }
    }
  }

  public populateValue(): void {
    this.branch = this.repository.defaultBranchName
    this.enableGitMod = this.repository.isSubmoduleEnabled || false
    this.selectedScope = this.repository.analyzeChangesetOnly ? 'granular' : 'broad'
    this.isRepoActivated = this.repository.isActivated
  }

  public async toggleState(): Promise<void> {
    await this.toggleRepoActivation({
      id: this.repository.id,
      isActivated: !this.isRepoActivated,
      login: this.$route.params.owner,
      provider: this.$route.params.provider
    })
    this.isRepoActivated = this.repository.isActivated
    this.isHovered = false
    this.refetchData()
  }

  async refetchData(): Promise<void> {
    const { owner, provider } = this.$route.params
    const baseParams = {
      provider,
      login: owner,
      refetch: true
    }
    const pageSize =
      (this.$localStore.get(`${provider}-${owner}-all-repos`, `currentPageSize`) as number) || 10

    this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
    this.fetchOwnerDetails(baseParams)
    this.fetchRepoList({
      ...baseParams,
      limit: pageSize,
      currentPageNumber: 0,
      query: null
    })
  }

  public updateHoverStyle(isHover: boolean): void {
    this.isHovered = isHover
  }

  public async updateDiscoverFeedPreference() {
    await this.updateRepoSettings({
      input: {
        id: this.repository.id,
        showInDiscover: !this.repository.showInDiscover
      }
    })
    await this.fetchRepoSettings()

    this.showSuccessToast()
  }

  async toggleMonorepoMode(close?: () => void) {
    const { provider, owner, repo } = this.$route.params

    this.togglingMonorepoMode = true

    try {
      const args = {
        repositoryId: this.repoIdMap[`${this.$providerMetaMap[provider].value}-${owner}-${repo}`]
      }

      const success = await (this.isMonorepo
        ? this.revertMonorepo(args)
        : this.convertRepoToMonorepo(args))

      if (success) {
        close?.()
        await this.fetchRepoDetails({ ...this.baseRouteParams, refetch: true })

        this.$router.push(`/${provider}/${owner}/${repo}`)

        const fetchActiveAnalysisRepoListArgs = {
          login: owner,
          provider,
          refetch: true
        }

        this.fetchActiveAnalysisRepoList(fetchActiveAnalysisRepoListArgs)

        this.fetchActiveAnalysisRepoListWithAnalyzers(fetchActiveAnalysisRepoListArgs)

        this.$localStore.set(`${provider}-${owner}`, 'refetch-team-repo-list', true)
      } else {
        throw new Error()
      }
    } catch (e) {
      const err = e as Error

      let errMsg: `${string}.` = this.isMonorepo
        ? 'Failed to disable monorepo mode. Please contact support.'
        : 'Failed to enable monorepo mode. Please contact support.'

      if (err.message) {
        errMsg = `${err.message.replace('GraphQL error: ', '')}.` as `${string}.`
      }

      this.$logErrorAndToast(err, errMsg)
    } finally {
      this.togglingMonorepoMode = false
    }
  }
}
</script>
