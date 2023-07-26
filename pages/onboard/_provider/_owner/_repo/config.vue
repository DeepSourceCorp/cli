<template>
  <section class="relative space-y-4">
    <div class="analyzer-selector-section hide-scroll space-y-4 overflow-y-scroll pb-26">
      <analyzer-search
        ref="analyzer-search-component"
        :selected-analyzers="selectedAnalyzerNames"
        :toggle-search="showAnalyzerSearchList"
        :is-processing="$fetchState.pending"
        :close-on-add="false"
        :show-selected-analyzers="true"
        @addAnalyzer="(analyzer) => toggleAnalyzer(analyzer.name, true)"
        @removeAnalyzer="(analyzer) => toggleAnalyzer(analyzer.name, false)"
        @closeSearch="showAnalyzerSearchList = false"
      />
      <div v-if="$fetchState.pending" class="grid grid-cols-1 gap-4">
        <div class="h-48 animate-pulse bg-ink-300"></div>
        <div class="h-32 animate-pulse bg-ink-300"></div>
      </div>
      <div
        v-else-if="selectedAnalyzers.length === 0"
        class="flex flex-col items-center space-y-4 rounded-lg border-2 border-dashed border-slate-400 px-6 py-16"
      >
        <z-icon icon="analyzers" size="large" color="vanilla-300" />
        <p class="mx-auto max-w-sm text-center text-sm leading-relaxed text-vanilla-300">
          Analyzers scan your code and find code health issues. Start by adding one for a technology
          that you use in this repository.
        </p>
        <z-button
          ref="add-analyzer-button"
          size="small"
          class="mx-auto"
          button-type="primary"
          icon="plus"
          @click="showAnalyzerSearchList = true"
        >
          Add an Analyzer
        </z-button>
      </div>
      <div v-else class="space-y-4 overflow-y-auto">
        <analyzer
          v-for="analyzer in selectedAnalyzers"
          :key="analyzer.shortcode"
          v-bind="analyzer"
          :analyzer-logo="analyzer.analyzerLogo"
          :available-transformers="analyzer.transformers"
          :analyzer-meta="analyzer.meta"
          :selected-analyzer="getConfig(analyzer.shortcode)"
          @onClose="toggleAnalyzer(analyzer.name, false)"
          @analyzersUpdated="syncAnalyzer"
        />
      </div>
      <form-group label="All analyzers" class="hidden w-full max-w-2xl flex-grow">
        <div class="grid grid-cols-2 gap-2">
          <template v-for="analyzer in analyzerList">
            <analyzer-title-card
              v-if="!analyzer.enabled"
              :key="analyzer.name"
              :icon="analyzer.icon"
              :analyzer-logo="analyzer.analyzerLogo"
              :name="analyzer.label"
              @click="toggleAnalyzer(analyzer.name, true)"
            />
          </template>
        </div>
      </form-group>
    </div>
    <div
      v-if="!actionDisabled"
      class="absolute bottom-0 w-full bg-gradient-to-t from-ink-400 via-ink-400 to-transparent pt-12 pb-0"
    >
      <z-button
        icon="zap"
        :label="LABEL_MAP[nextStep]"
        :disabled="actionDisabled"
        class="w-full"
        @click="triggerNextStep"
      />
    </div>
    <add-default-branch-modal
      v-if="showGSRActivationModal"
      :login="$route.params.login"
      :repo-name="$route.params.login"
      :toml="toml"
      :repo-id="$route.params.login ? selectedRepo.id : ''"
      @onClose="showGSRActivationModal = false"
    />
  </section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon } from '@deepsource/zeal'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import { AnalyzerInterface } from '~/store/analyzer/list'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import AnalyzerListMixin from '~/mixins/analyzerListMixin'
import { Maybe, VcsProviderChoices } from '~/types/types'
import { RepoConfigAnalyzerMeta, RepoConfigInterface } from '~/store/repository/detail'
import TomlGeneratorMixin from '~/mixins/tomlGeneratorMixin'
import MetaMixin from '~/mixins/metaMixin'

export enum NextActions {
  GENERATE_AND_COMMIT_CONFIG = 'generateAndCommitConfig',
  AD_HOC_RUN = 'adhocRun',
  GENERATE_AND_CREATE_PR = 'generateAndCreatePr',
  GENERATE_AND_SAVE_IN_DB = 'generateAndSaveInDb'
}

/**
 * Config generator page for onboarding
 **/
@Component({
  components: {
    ZInput,
    ZButton,
    ZIcon
  },
  middleware: ['restrictOnboarding'],
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class OnboardConfig extends mixins(
  OwnerDetailMixin,
  RepoDetailMixin,
  AnalyzerListMixin,
  TomlGeneratorMixin,
  MetaMixin
) {
  showAnalyzerSearchList = ''
  selectedAnalyzers: Array<AnalyzerInterface> = []
  showGSRActivationModal = false

  metaTitle = 'Activate analysis • DeepSource'
  metaDescription = 'Generate the config to run analysis on this repository'

  /**
   * Generates the config toml from userConfig
   * @returns {string}
   **/
  get toml(): string {
    return this.tomlTemplate(
      this.userConfig,
      this.userConfig['test_patterns'],
      this.userConfig['exclude_patterns']
    )
  }

  LABEL_MAP = {
    [NextActions.GENERATE_AND_COMMIT_CONFIG]: 'Commit config and start analysis',
    [NextActions.AD_HOC_RUN]: 'Start analysis with this config',
    [NextActions.GENERATE_AND_CREATE_PR]:
      this.$route.params.provider === 'gl'
        ? 'Create merge request with the config'
        : 'Create pull request with the config',
    [NextActions.GENERATE_AND_SAVE_IN_DB]: 'Save config and start analysis'
  }

  /**
   * This is the last step of onboarding
   * based on the repository permissions, this
   * function triggers the submit action
   * @return {Promise<void>}
   */
  async triggerNextStep(): Promise<void> {
    // AD_HOC_RUN: this.triggerAdHocOnboardingRun,
    // GENERATE_AND_CREATE_PR: this.saveConfigAndCreatePullRequest,
    // GENERATE_AND_COMMIT_CONFIG: this.saveConfigAndCommit,
    // GENERATE_AND_SAVE_IN_DB: this.toggleGSRActivationModal

    if (this.nextStep === NextActions.AD_HOC_RUN) {
      await this.triggerAdHocOnboardingRun()
    }

    if (this.nextStep === NextActions.GENERATE_AND_CREATE_PR) {
      await this.saveConfigAndCreatePullRequest()
    }

    if (this.nextStep === NextActions.GENERATE_AND_COMMIT_CONFIG) {
      await this.saveConfigAndCommit()
    }

    if (this.nextStep === NextActions.GENERATE_AND_SAVE_IN_DB) {
      this.toggleGSRActivationModal()
    }
  }

  /**
   * Determine what the submit action is based on
   * repo perms and deployment type
   * @return {NextActions}
   */
  get nextStep(): NextActions {
    if (this.$config.onPrem) {
      if (this.repository.vcsProvider === VcsProviderChoices.Gsr) {
        return NextActions.GENERATE_AND_SAVE_IN_DB
      }

      if (this.repository.isCommitPossible) {
        return NextActions.GENERATE_AND_COMMIT_CONFIG
      }

      return NextActions.GENERATE_AND_CREATE_PR
    }

    return this.repository.isCommitPossible
      ? NextActions.GENERATE_AND_COMMIT_CONFIG
      : NextActions.AD_HOC_RUN
  }

  /**
   * toggle the GSR modal to fetch the main branch name
   * @return {void}
   */
  toggleGSRActivationModal(): void {
    this.showGSRActivationModal = !this.showGSRActivationModal
  }

  /**
   * Proxy method to this.commitConfig
   * @return {Promise<void>}
   */
  async saveConfigAndCreatePullRequest(): Promise<void> {
    await this.commitConfig(true)
  }

  /**
   * Proxy method to this.commitConfig
   * @return {Promise<void>}
   */
  async saveConfigAndCommit(): Promise<void> {
    await this.commitConfig(false)
  }

  /**
   * This function does the following
   * 1. Verify the TOML config
   * 2. Run the `commitConfigToVcs` mutation
   * 3. Route to the running page or the repo issues page based on createPullRequest
   * @param {any} createPullRequest=false
   * @return {Promise<void>}
   */
  async commitConfig(createPullRequest = false): Promise<void> {
    const pullLabel = this.$route.params.provider === 'gl' ? 'merge' : 'pull'

    const { owner, provider, repo } = this.$route.params

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
            message: `We have created a ${pullLabel} request with the configuration, analysis will start automatically once it is merged.`,
            timeout: 5
          })

          this.$router.push({
            path: `/${provider}/${owner}/${repo}/issues`
          })
        } else {
          this.$router.push({
            path: `/onboard/${provider}/${owner}/${repo}/running/`
          })
        }
      } else {
        this.$toast.danger(
          'Something went wrong while creating the configuration for this repository, contact support'
        )
      }
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
    }
  }

  /**
   * Trigger an AdHoc run and route to the running page
   * @return {Promise<void>}
   */
  async triggerAdHocOnboardingRun(): Promise<void> {
    const { provider, owner, repo } = this.$route.params

    // trigger the run
    try {
      await this.triggerAdHocRun({ config: this.toml })

      this.$router.push({
        path: `/onboard/${provider}/${owner}/${repo}/running`
      })
    } catch (err) {
      const error = err as Error
      const errMsg = `${error.message.replace('GraphQL error: ', '')}.` as `${string}.`

      this.$logErrorAndToast(err as Error, errMsg)
    }
  }

  public userConfig: RepoConfigInterface = {
    version: 1,
    analyzers: [],
    transformers: [],
    test_patterns: [],
    exclude_patterns: []
  }

  /**
   * This function does the following
   * 1. Fetch all the data required for the config generator to work
   * 2. Toggle the supported Analyzers
   * 3. Populate userConfig
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { provider, owner, repo } = this.$route.params
    await this.fetchAnalyzers()
    await this.fetchIsCommitPossible(this.baseRouteParams)
    await this.fetchRepoDetails({
      provider,
      owner,
      name: repo,
      refetch: true
    })

    if (this.repository.supportedAnalyzers) {
      this.repository.supportedAnalyzers.forEach((analyzer: Maybe<string>) => {
        if (analyzer) {
          this.toggleAnalyzer(analyzer, true)
        }
      })
    }
  }

  /**
   * Flag to enable or disable the next action,
   * to ensure atleast one analyzer is selected
   * before triggering the first run
   * @return {boolean}
   */
  get actionDisabled(): boolean {
    return this.selectedAnalyzers.length == 0
  }

  get selectedAnalyzerNames(): string[] {
    return this.selectedAnalyzers.map((analyzer) => analyzer.shortcode)
  }

  /**
   * Sync the analyzer config with userConfig
   * once the user makes any changes from the UI
   * @param {RepoConfigAnalyzerMeta} analyzer
   * @return {void}
   */
  public syncAnalyzer(analyzer: RepoConfigAnalyzerMeta): void {
    // Add/update analyzer to adhocrun store
    const index = this.userConfig.analyzers.findIndex((lang) => lang.name === analyzer.name)

    // if present
    if (index > -1) {
      // update the object with new config
      Object.assign(this.userConfig.analyzers[index], analyzer)
    } else {
      // Update
      this.userConfig.analyzers.push(analyzer)
    }
  }

  /**
   * Return the analyzer config for a particular analyzer from the userConfig
   * @param {string} name
   * @return {RepoConfigAnalyzerMeta | Record<string, unknown>}
   */
  getConfig(name: string): RepoConfigAnalyzerMeta | Record<string, unknown> {
    const filteredList = this.userConfig.analyzers.filter((config) => config.name === name)
    return filteredList.length ? filteredList[0] : {}
  }

  /**
   * Toggle the analyzer from the selected analyzers
   * @param {string} name
   * @param {boolean} isSelected
   * @return {void}
   */
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
        this.userConfig.analyzers = this.userConfig.analyzers.filter(
          (analyzer) => analyzer.name !== name
        )
        // remove analyzer from store when disabled
      }
    }
  }
}
</script>
<style>
.analyzer-selector-section {
  height: calc(100vh - 15rem);
}
</style>
