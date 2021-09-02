<template>
  <div class="flex w-screen min-h-screen mx-auto text-vanilla-100">
    <!-- Left section -->
    <div class="flex items-center justify-center w-full xl:w-7/12 bg-ink-400">
      <div
        class="flex flex-col items-center justify-center w-full h-full p-6 space-y-6 md:p-0 md:h-auto md:w-3/5"
      >
        <div class="hidden w-full lg:block">
          <z-stepper>
            <z-step title="Step 1" description="Connect provider" status="completed"></z-step>
            <z-step title="Step 2" description="Set preferences" status="active"></z-step>
            <z-step title="Step 3" description="Pick a repository"></z-step>
          </z-stepper>
        </div>

        <!-- TODO: Change this transition later -->
        <transition enter-active-class="animate-slide-bottom-enter-active" mode="out-in">
          <!-- Repo Selection -->
          <repo-selector
            class="flex flex-col w-full gap-y-3"
            v-if="!isAnalyzer"
            @pickRepo="repoSelected"
          ></repo-selector>
          <!-- Analyzer Selection -->
          <div
            v-else
            class="flex flex-col w-full h-auto p-3 space-y-3 rounded-md bg-ink-300 max-h-102 sm:max-h-100 sm:h-4/5"
          >
            <!-- Heading -->
            <div class="flex items-center w-full space-x-2">
              <z-icon icon="lock" size="small"></z-icon>
              <!-- TODO: Get Repo name and handle name -->
              <div class="flex-1 text-sm">{{ $route.params.login }}/{{ selectedRepoName }}</div>
              <button @click="showFilters()">
                <z-icon icon="x" size="small" class="cursor-pointer"></z-icon>
              </button>
            </div>
            <!-- Suggested Analyzer -->
            <div class="text-xs tracking-wider uppercase text-vanilla-400">Suggested analyzer</div>
            <!-- Selected Analyzers -->
            <div
              class="flex flex-col w-full py-1 space-y-2 overflow-x-scroll hide-scroll md:flex-row md:space-y-0 md:space-x-2"
            >
              <!-- Analyzer Example -->
              <analyzer-card
                v-for="analyzer in selectedAnalyzers"
                :key="analyzer.name"
                :label="analyzer.label"
                :name="analyzer.name"
                :analyzerLogo="analyzer.analyzerLogo"
                :repo="selectedRepoName"
                :icon="analyzer.icon"
                :meta="analyzer.meta"
                @onClose="toggleAnalyzer(analyzer.name, false)"
                @configUpdated="syncAnalyzer"
              >
              </analyzer-card>
              <!-- Empty Placeholder -->
              <div
                v-if="selectedAnalyzers.length == 0"
                class="box-border flex items-center h-24 p-6 text-sm text-center border border-dashed rounded-sm md:h-40 border-vanilla-400 md:min-w-1/2 md:w-1/2"
              >
                <div>
                  Add new analyzer by clicking the
                  <z-icon icon="plus" class="inline-block" size="small"></z-icon> icon below
                </div>
              </div>
            </div>
            <!-- Add more Analyzer -->
            <div class="text-xs tracking-wider uppercase text-vanilla-400">Add more analyzers</div>
            <!-- Analyzers -->
            <div class="grid grid-cols-2 gap-2 overflow-scroll auto-rows-max">
              <template v-for="analyzer in analyzerList">
                <analyzer-title-card
                  v-if="!analyzer.enabled"
                  :key="analyzer.name"
                  :icon="analyzer.icon"
                  :analyzerLogo="analyzer.analyzerLogo"
                  :name="analyzer.label"
                  @click="toggleAnalyzer(analyzer.name, true)"
                >
                </analyzer-title-card>
              </template>
            </div>
          </div>
        </transition>
        <div class="fixed bottom-0 left-0 w-full md:static space-y-2">
          <z-button
            v-if="repository.isCommitPossible"
            class="w-full"
            buttonType="primary"
            icon="plus"
            label="Add configuration and start analysis"
            loadingLabel="Activating Repository"
            :disabled="actionDisabled"
            :isLoading="commitLoading"
            @click="commitConfig(false)"
          >
          </z-button>
          <z-button
            v-else-if="repository.isAutofixEnabled"
            buttonType="primary"
            class="w-full"
            :disabled="actionDisabled"
            @click="commitConfig(true)"
          >
            Create {{ $route.params.provider === 'gl' ? 'merge' : 'pull' }} request with config
          </z-button>
          <z-button
            v-else
            buttonType="primary"
            class="w-full"
            :disabled="actionDisabled"
            @click="showNextStepsModal = true"
          >
            Show next steps
          </z-button>
          <z-button
            :disabled="!selectedRepoName"
            class="w-full"
            buttonType="secondary"
            @click="activateRepo"
          >
            I’ve added .deepsource.toml, activate repo
          </z-button>
        </div>
      </div>
    </div>
    <z-modal
      v-if="showNextStepsModal"
      @primaryAction="activateRepo"
      @onClose="showNextStepsModal = false"
      title="Setup DeepSource config"
      primaryActionLabel="I’ve added deepsource.toml, move on to analysis"
    >
      <div class="p-4">
        <p class="text-sm text-vanilla-400">
          Create a new file called
          <span class="font-mono text-vanilla-300">.deepsource.toml</span> in the root folder of the
          repository and commit the following configuration. Make sure you’re on the default branch.
        </p>
        <div class="p-3 mt-4 overflow-y-scroll text-sm rounded-md max-h-64 bg-ink-400">
          <highlightjs language="toml" :code="toml" />
        </div>
        <z-button
          @click="copyToml"
          :icon="copyIcon"
          size="small"
          buttonType="primary"
          color="vanilla-200"
          class="w-full mt-2 bg-ink-200 hover:bg-ink-100"
        >
          Copy config
        </z-button>
      </div>
    </z-modal>
    <!-- Preview Component - Right section -->
    <div class="flex-row-reverse items-center hidden w-5/12 bg-ink-300 bg-opacity-40 xl:flex">
      <analyzer-preview
        :viewer="viewer"
        :selectedAnalyzers="selectedAnalyzers"
        :selectedRepo="selectedRepoName"
      ></analyzer-preview>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZStepper, ZStep, ZModal } from '@deepsourcelabs/zeal'

import {
  RepoSelector,
  AnalyzerPreview,
  AnalyzerTitleCard,
  AnalyzerCard
} from '@/components/Onboard'

import { AdHocRunAnalyzer } from '~/store/repository/adHocRun'
import { AnalyzerListActions, AnalyzerListGetters, AnalyzerInterface } from '~/store/analyzer/list'

// types
import { RepoInterface } from '~/store/repository/list'
import AdHocRunMixin from '~/mixins/adHocRunMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

const analyzerListStore = namespace('analyzer/list')

@Component({
  components: {
    ZButton,
    ZStepper,
    ZStep,
    ZIcon,
    ZModal,
    RepoSelector,
    AnalyzerPreview,
    AnalyzerTitleCard,
    AnalyzerCard
  },
  middleware: ['restrictOnboarding'],
  meta: {
    auth: {
      strict: true
    }
  }
})
export default class ChooseRepo extends mixins(AdHocRunMixin, ActiveUserMixin, RepoDetailMixin) {
  @analyzerListStore.Getter(AnalyzerListGetters.ANALYZERS)
  analyzerList: Array<AnalyzerInterface>

  public isAnalyzer = false
  public showNextStepsModal = false
  public selectedRepo: RepoInterface | null
  public selectedRepoName = ''
  public selectedAnalyzers: Array<AnalyzerInterface> = []

  async fetch(): Promise<void> {
    await this.$store.dispatch(`analyzer/list/${AnalyzerListActions.FETCH_ANALYZER_LIST}`)
  }

  public showFilters(): void {
    this.resetAnalyzerPreferences()
    this.selectedRepo = null
    this.selectedRepoName = ''
    this.isAnalyzer = false
  }

  get actionDisabled(): boolean {
    return !this.isAnalyzer || this.selectedAnalyzers.length == 0
  }

  repoSelected(repo: RepoInterface): void {
    this.selectedRepo = repo
    if (this.selectedRepo && this.selectedRepo.id.trim().length > 0) {
      this.isAnalyzer = true
      this.selectedRepoName = this.selectedRepo.name
      // Set the repo id in store
      this.updateRepository(this.selectedRepo.id.trim())
      const { provider, login } = this.$route.params
      this.fetchIsCommitPossible(this.baseRouteParams)
      this.fetchBasicRepoDeatils({
        provider,
        owner: login,
        name: this.selectedRepoName,
        refetch: true
      })

      this.selectedRepo.supportedAnalyzers.forEach((analyzer: string) => {
        this.toggleAnalyzer(analyzer, true)
      })
    } else {
      this.isAnalyzer = false
      // remove repo from store
      this.updateRepository('')
    }
  }

  public syncAnalyzer(analyzer: AdHocRunAnalyzer): void {
    // Add/update analyzer to adhocrun store
    this.updateAnalyzer(analyzer)
  }

  public toggleAnalyzer(name: string, isSelected: boolean): void {
    const index = this.analyzerList.findIndex((analyzer) => analyzer.name === name)
    if (index > -1) {
      this.analyzerList[index].enabled = isSelected
      const analyzerToToggle: AnalyzerInterface = this.analyzerList[index]

      if (isSelected) {
        const selectedIndex = this.selectedAnalyzers.findIndex((analyzer) => analyzer.name === name)
        if (!(selectedIndex > -1)) {
          // Add if not already present
          this.selectedAnalyzers.unshift(analyzerToToggle)
        }
      } else {
        this.selectedAnalyzers = this.selectedAnalyzers.filter((analyzer) => analyzer.enabled)
        this.removeAnalyzer(analyzerToToggle.name)
        // remove analyzer from store when disabled
      }
    }
  }

  public resetAnalyzerPreferences(): void {
    this.analyzerList.forEach((analyzer) => {
      analyzer.enabled = false
    })
    this.selectedAnalyzers = []
    // reset repo id and selected analyzer list
    this.resetPreferences()
  }

  public commitLoading = false

  async commitConfig(createPullRequest = false): Promise<void> {
    this.commitLoading = true
    const pullLabel = this.$route.params.provider === 'gl' ? 'merge' : 'pull'
    const { provider, login } = this.$route.params

    const args = {
      config: this.toml,
      repositoryId: this.repository.id,
      createPullRequest
    }

    try {
      const response = await this.commitConfigToVcs(args)

      if (response.ok) {
        if (createPullRequest) {
          this.$toast.show({
            type: 'success',
            message: `<p>We have created a ${pullLabel} request with the configuration.</p><p class="mt-1">Analysis will start automatically once you merge the ${pullLabel} request.</p>`,
            timeout: 10
          })
        } else {
          this.$toast.success(
            `Successfully activated ${this.repository.name}, the first run may take a while to finish`
          )
        }
        try {
          this.fetchBasicRepoDeatils({
            provider,
            owner: login,
            name: this.selectedRepoName,
            refetch: true
          })
        } catch (e) {}

        this.commitLoading = false

        this.$router.push(`/${provider}/${login}/${this.selectedRepoName}/issues`)
      } else {
        this.$toast.danger(
          'Something went wrong while creating the configuration for this repository, contact support'
        )
      }
    } catch (e) {
      this.logSentryErrorForUser(e, 'Generate config - Onboarding', args)
      this.$toast.danger(e.message.replace('GraphQL error: ', ''))
    } finally {
      this.commitLoading = false
    }
  }

  async activateRepo(): Promise<void> {
    const { provider, login } = this.$route.params
    await this.toggleRepoActivation({
      id: this.repository.id,
      isActivated: true
    })

    try {
      this.fetchBasicRepoDeatils({
        provider,
        owner: login,
        name: this.selectedRepoName,
        refetch: true
      })
    } catch (e) {}

    this.$router.push(`/${provider}/${login}/${this.selectedRepoName}/issues`)
  }

  public copyIcon = 'clipboard'

  copyToml(): void {
    this.$copyToClipboard(this.toml)
    this.copyIcon = 'check'
    setTimeout(() => {
      this.copyIcon = 'clipboard'
    }, 500)
  }

  // async triggerRun(): Promise<void> {
  //   const { provider, login } = this.$route.params
  //   // trigger the run
  //   await this.triggerAdHocRun({ config: this.toml })
  //   this.$router.push({
  //     path: `/onboard/${provider}/${login}/running/${this.selectedRepoName}`
  //   })
  // }
}
</script>
