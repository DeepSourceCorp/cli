<template>
  <div class="p-4 flex flex-col space-y-6 max-w-2xl">
    <!-- title -->
    <div class="text-lg font-medium text-vanilla-100">General</div>
    <!-- Default Analysis Branch -->
    <form-group>
      <div class="relative">
        <text-input
          inputWidth="x-small"
          label="Default analysis branch"
          inputId="team-settings-branch"
          v-model="branch"
          @blur="updateBranch"
        ></text-input>
        <div class="absolute top-0 left-full px-4 py-2">
          <info-banner
            info="This is the base branch for analysis by DeepSource. Your issues tab will be populated with the issues found on this branch."
          ></info-banner>
        </div>
      </div>
      <toggle-input
        inputWidth="x-small"
        label="Enable git submodules"
        inputId="enable-git-submodules"
        v-model="enableGitMod"
        @input="updateRepositorySettings"
      >
        <template slot="description">
          If you are using private submodules, ensure that DeepSource has access to them via an
          <nuxt-link
            :to="$generateRoute(['settings', 'ssh-access'])"
            class="text-juniper font-medium"
            >SSH key</nuxt-link
          >.
        </template>
      </toggle-input>
    </form-group>
    <z-divider margin="my-2 mx-0"></z-divider>
    <!-- Issue Configuration -->
    <div class="flex flex-col gap-y-4 relative">
      <div class="text-sm text-vanilla-100 flex-1">Issue configuration</div>
      <z-table class="text-vanilla-100">
        <template v-slot:head>
          <z-table-row>
            <z-table-cell
              v-for="head in headerData"
              :key="head.title"
              class="text-sm font-bold"
              :class="head.align"
              >{{ head.title }}</z-table-cell
            >
          </z-table-row>
        </template>
        <template v-slot:body>
          <z-table-row
            v-for="type in repoSettings"
            :key="type.name"
            class="text-vanilla-100 hover:bg-ink-300"
          >
            <z-table-cell class="text-sm font-normal" text-align="left">{{
              type.name
            }}</z-table-cell>
            <z-table-cell
              class="text-sm font-normal flex justify-center items-center"
              text-align="center"
            >
              <z-checkbox
                v-model="type.isIgnoredToDisplay"
                class="h-full"
                :true-value="false"
                :false-value="true"
                spacing="4"
                fontSize="base"
                @change="updateRepositorySettings"
              />
            </z-table-cell>
            <z-table-cell
              class="text-sm font-normal flex justify-center items-center"
              text-align="center"
            >
              <z-checkbox
                v-model="type.isIgnoredInCheckStatus"
                class="h-full m-0"
                :true-value="false"
                :false-value="true"
                spacing="4"
                fontSize="base"
                @change="updateRepositorySettings"
              />
            </z-table-cell>
          </z-table-row>
        </template>
      </z-table>
      <div class="absolute top-0 left-full px-4">
        <info-banner
          info="Control what issues are reported by DeepSource and what issues block pull requests."
        ></info-banner>
      </div>
    </div>
    <form-group label="Analysis settings">
      <div class="relative">
        <div class="grid py-4 gap-4 grid-cols-fr-16">
          <div>
            <label for="repo-settings-analysis-scope" class="text-sm text-vanilla-100 flex-1">
              Analysis scope
            </label>
          </div>
          <z-select v-if="selectedScope" v-model="selectedScope" spacing="py-1" class="text-sm">
            <z-option label="Granular (recommended)" value="granular"></z-option>
            <z-option label="Broad" value="broad"></z-option>
          </z-select>
        </div>
        <div class="absolute top-0 left-full px-4">
          <info-banner
            info="If <b>Granular</b> is selected, issues would be reported only for lines that have been added or modified across all the files affected. <br> <br> If <b>Broad</b> is selected, all issues will be reported in files that have been updated or added, beware, this can be noisy."
          ></info-banner>
        </div>
      </div>
      <button-input
        label="Analysis configuration"
        inputId="repo-settings-analysis-config"
        buttonLabel="Generate configuration"
        :to="$generateRoute(['generate-config'])"
        inputWidth="x-small"
      >
        <template slot="description">
          Change the deepsource.toml file in the repository's root to modify the analysis
          configuration.
        </template>
      </button-input>
      <div class="relative" v-if="canActivateRepo">
        <div class="grid py-4 gap-4 grid-cols-fr-16">
          <div>
            <label :for="inputId" class="text-sm text-vanilla-100 flex-1"> Analysis status </label>
            <div class="text-xs text-vanilla-400 leading-5">
              Careful! DeepSource will stop monitoring changes to your code if analysis is
              deactivated
            </div>
          </div>
          <div class="text-right flex flex-col">
            <button
              @click="toggleState()"
              @mouseenter="updateHoverStyle(true)"
              @mouseleave="updateHoverStyle(false)"
              class="
                flex
                items-center
                justify-center
                space-x-2
                self-end
                h-8
                px-4
                rounded-sm
                w-52
                transition-all
                duration-150
                ease-in-out
                font-medium
              "
              :class="{
                'bg-transparent text-cherry border border-cherry': isRepoActivated && isHovered,
                'bg-transparent text-juniper border border-juniper': !isRepoActivated && isHovered,
                'bg-cherry text-vanilla-100': !isRepoActivated && !isHovered,
                'bg-juniper text-ink-400': isRepoActivated && !isHovered
              }"
            >
              <z-icon
                :icon="icon"
                size="small"
                :color="{
                  'vanilla-100': !isRepoActivated && !isHovered,
                  'ink-400': isRepoActivated && !isHovered
                }"
              ></z-icon>
              <span class="text-sm leading-none">{{ buttonText }}</span>
            </button>
          </div>
        </div>
      </div>
    </form-group>

    <z-divider v-if="!repository.isPrivate" margin="my-2 mx-0" />

    <form-group v-if="!repository.isPrivate">
      <div class="relative">
        <button-input
          label="Add to discover"
          inputId="add-to-discover"
          :buttonLabel="repository.showInDiscover ? 'Remove your project' : 'Add your project'"
          inputWidth="x-small"
          @click="updateDiscoverFeedPreference"
        >
          <template slot="description">
            Add your repository to
            <nuxt-link to="/discover" class="font-medium text-juniper">Discover</nuxt-link> to allow
            others to find issues and fix them.
          </template>
        </button-input>

        <div class="absolute top-0 px-4 left-full">
          <info-banner
            info="Control whether your repository is listed on Discover. Once listed, other users would be able to find your repository, and look at the detected issues."
          />
        </div>
      </div>
    </form-group>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { ToggleInput, TextInput, SelectInput, FormGroup } from '@/components/Form'
import { Notice, InfoBanner } from '@/components/Settings/index'
import {
  ZDivider,
  ZInput,
  ZTable,
  ZTableRow,
  ZTableCell,
  ZIcon,
  ZCheckbox,
  ZButton,
  ZToggle,
  ZSelect,
  ZOption
} from '@deepsourcelabs/zeal'
import { RepositoryDetailActions } from '~/store/repository/detail'
import { IssueTypeSetting, Maybe, TeamMemberRoleChoices } from '~/types/types'
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
    ZTable,
    ZTableRow,
    ZTableCell,
    ZCheckbox,
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
        RepoPerms.CHANGE_ISSUE_TYPES_TO_REPORT,
        RepoPerms.CHANGE_ISSUES_TO_TYPE_TO_BLOCK_PRS_ON,
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

  public headerData = [
    { title: 'Issue type', align: 'text-left' },
    { title: 'Report Issues', align: 'text-center' },
    { title: 'Block Pull Requests', align: 'text-center' }
  ]

  public selectedScope = ''

  public repoSettings: Array<IssueTypeSetting> = []

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
    this.refinedIssueTypeSettings()
    this.isFetchingData = false
  }

  public async fetchRepoSettings() {
    await this.fetchRepositorySettingsGeneral({
      provider: this.$route.params.provider,
      owner: this.$route.params.owner,
      name: this.$route.params.repo
    })
  }

  public refinedIssueTypeSettings(): void {
    if (this.repository && this.repository.issueTypeSettings) {
      this.repository?.issueTypeSettings.forEach((setting: Maybe<IssueTypeSetting>) => {
        const newObj: IssueTypeSetting = {}
        newObj.slug = setting?.slug
        newObj.name = setting?.name
        newObj.isIgnoredToDisplay = setting?.isIgnoredToDisplay
        newObj.isIgnoredInCheckStatus = setting?.isIgnoredInCheckStatus
        this.repoSettings.push(newObj)
      })
    }
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
    if (
      this.repository?.id &&
      this.repository?.issueTypeSettings &&
      this.repoSettings.length &&
      !this.isFetchingData
    ) {
      await this.updateRepoSettings({
        input: {
          id: this.repository.id,
          showInDiscover: this.repository.showInDiscover,
          defaultBranchName: this.branch,
          isSubmoduleEnabled: this.enableGitMod,
          analyzeChangesetOnly: this.selectedScope == 'granular' ? true : false,
          keepExistingIssues: true,
          issueTypeSettings: this.repoSettings.length
            ? this.repoSettings
            : this.repository.issueTypeSettings
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
