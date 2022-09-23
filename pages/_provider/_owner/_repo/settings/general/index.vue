<template>
  <div class="flex flex-col max-w-2xl p-4 gap-y-2">
    <!-- title -->
    <div class="text-lg font-medium text-vanilla-100">General</div>
    <form-group :divide="false">
      <!-- Default Analysis Branch -->

      <div class="grid gap-4 py-4 lg:hidden">
        <div class="col-span-full md:col-auto">
          <label for="team-settings-branch" class="text-sm text-vanilla-100">
            Default analysis branch
          </label>

          <div class="mt-2">
            <z-input
              id="team-settings-branch"
              v-model="branch"
              @blur="updateBranch"
              class="px-2"
              size="small"
            />
          </div>
        </div>
        <p class="max-w-sm text-xs leading-5 text-vanilla-400">
          This is the base branch for analysis by DeepSource. Your issues tab will be populated with
          the issues found on this branch.
        </p>
      </div>

      <text-input
        v-model="branch"
        input-width="x-small"
        label="Default analysis branch"
        input-id="team-settings-branch"
        :cascade-input="true"
        @blur="updateBranch"
        class="flex-grow hidden max-w-2xl lg:grid"
      >
        <template slot="description">
          <p class="max-w-sm">
            This is the base branch for analysis by DeepSource. Your issues tab will be populated
            with the issues found on this branch.
          </p>
        </template>
      </text-input>

      <toggle-input
        input-width="x-small"
        label="Enable git submodules"
        input-id="enable-git-submodules"
        v-model="enableGitMod"
        class="max-w-2xl border-t border-ink-300"
        @input="updateRepositorySettings"
      >
        <template slot="description">
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

    <form-group label="Analysis settings" class="max-w-2xl">
      <!-- needed custom markup for mobile view cause we're rearranging order of title, description & z-select -->
      <section>
        <div class="grid gap-4 py-4 lg:hidden">
          <div class="col-span-full md:col-auto">
            <label for="repo-setting-analysis-scope" class="text-sm text-vanilla-100">
              Analysis scope
            </label>

            <div class="h-8 mt-2">
              <z-select
                v-if="selectedScope"
                v-model="selectedScope"
                spacing="py-1 px-2"
                class="text-sm"
              >
                <z-option label="Granular (recommended)" value="granular"></z-option>
                <z-option label="Broad" value="broad"></z-option>
              </z-select>
            </div>
          </div>
          <ul class="max-w-sm ml-4 text-xs leading-5 list-disc list-outside text-vanilla-400">
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
              <z-option label="Granular (recommended)" value="granular"></z-option>
              <z-option label="Broad" value="broad"></z-option>
            </z-select>
          </div>

          <template slot="description">
            <ul class="max-w-sm ml-4 list-disc list-outside">
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
        <template slot="description">
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
          @click="toggleState()"
          @mouseenter="updateHoverStyle(true)"
          @mouseleave="updateHoverStyle(false)"
          class="flex items-center self-end justify-center w-full h-10 px-4 py-1 space-x-2 font-medium transition-all duration-150 ease-in-out rounded-sm md:h-8 md:-ml-4 md:w-52"
          :class="{
            'bg-transparent text-cherry border border-cherry': isRepoActivated && isHovered,
            'bg-transparent text-juniper border border-juniper': !isRepoActivated && isHovered,
            'bg-cherry text-vanilla-100': !isRepoActivated && !isHovered,
            'bg-juniper text-ink-400': isRepoActivated && !isHovered
          }"
        >
          <z-icon :icon="icon" size="small" color="current" />
          <span class="text-sm leading-none">{{ buttonText }}</span>
        </button>

        <template slot="description">
          <p class="max-w-sm">
            Careful! DeepSource will stop monitoring changes to your code if analysis is deactivated
          </p>
        </template>
      </button-input>
    </form-group>

    <form-group
      v-if="!$config.onPrem && !repository.isPrivate"
      label="Discover settings"
      class="max-w-2xl"
    >
      <div>
        <button-input
          label="Add to discover"
          input-id="add-to-discover"
          :full-width="true"
          :button-label="repository.showInDiscover ? 'Remove your project' : 'Add your project'"
          input-width="x-small"
          @click="updateDiscoverFeedPreference"
        >
          <template slot="description">
            <p class="max-w-sm">
              Add your repository to
              <nuxt-link to="/discover" class="font-medium text-juniper">Discover</nuxt-link> to
              allow others to find issues and fix them.
            </p>
          </template>
        </button-input>
      </div>
    </form-group>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { ToggleInput, TextInput, SelectInput, FormGroup } from '@/components/Form'
import { Notice, InfoBanner } from '@/components/Settings/index'
import { ZDivider, ZInput, ZIcon, ZButton, ZToggle, ZSelect, ZOption } from '@deepsourcelabs/zeal'
import { Maybe, TeamMemberRoleChoices } from '~/types/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { RepoPerms, TeamPerms } from '~/types/permTypes'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RepoListMixin from '~/mixins/repoListMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

@Component({
  components: {
    Notice,
    InfoBanner,
    ZInput,
    ZDivider,
    ZToggle,
    ZButton,
    ZSelect,
    ZOption,
    ZIcon,
    // form
    ToggleInput,
    TextInput,
    SelectInput,
    FormGroup
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

  async fetch(): Promise<void> {
    this.isFetchingData = true
    await this.fetchRepoSettings()
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
      isActivated: !this.isRepoActivated
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
    this.fetchActiveAnalysisRepoList({
      ...baseParams,
      limit: 10
    })
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
}
</script>
