<template>
  <!-- Title -->
  <div>
    <div class="flex items-center justify-between p-4 border-b border-ink-200">
      <h4 class="flex items-center space-x-2 text-md text-vanilla-400">
        <z-icon :icon="repository.isPrivate ? 'lock' : 'globe'" size="small"></z-icon>
        <span>
          <nuxt-link :to="['', $route.params.provider, owner].join('/')">{{ owner }}</nuxt-link>
          /
          <b class="text-vanilla-100">{{ repo }}</b>
        </span>
      </h4>
      <div
        class="flex items-center p-1 px-2 space-x-2 text-sm border rounded-md border-ink-200 text-vanilla-400"
        v-if="!repository.isAutofixEnabled"
      >
        <span
          class="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-honey bg-opacity-50"
        >
          <span class="w-2 h-2 bg-opacity-100 rounded-full bg-honey"></span>
        </span>
        <span class="leading-none">Autofix app is not installed</span>
        <z-button
          size="x-small"
          icon="autofix"
          buttonType="secondary"
          v-if="canEnableAutofix"
          @click="showInstallAutofixAppModal = true"
          >Install Now</z-button
        >
      </div>
      <install-autofix-modal
        v-if="showInstallAutofixAppModal"
        @close="showInstallAutofixAppModal = false"
      />
    </div>
    <div class="grid max-w-6xl grid-cols-9 p-4 space-x-4">
      <!-- Steps -->
      <z-stepper align="vertical" :showNumbers="true" class="w-full col-span-5">
        <z-step class="w-full">
          <template slot="title">
            <div
              class="mt-1 text-xs font-medium leading-snug tracking-wider uppercase text-vanilla-400"
            >
              Analyzers
            </div>
          </template>
          <template slot="description">
            <!-- Select which analyzer to add -->
            <analyzer-selector
              class="mt-2"
              ref="analyzer-selector"
              :is-processing="isProcessing"
              :userConfig="userConfig"
              @updateAnalyzers="updateAnalyzerConfig"
              @updateTransformers="updateTransformersConfig"
            ></analyzer-selector>
          </template>
        </z-step>
        <z-step class="w-full">
          <template slot="title">
            <div
              class="mt-1 text-xs font-medium leading-snug tracking-wider uppercase text-vanilla-400"
            >
              Patterns
            </div>
          </template>
          <template slot="description">
            <!-- select patterns -->
            <patterns-selector
              @updatePatterns="updatePatternsConfig"
              :vcsUrl="repository.vcsUrl"
              :testPatterns="userConfig.test_patterns || []"
              :excludePatterns="userConfig.exclude_patterns || []"
              class="grid grid-cols-1 gap-4 mt-2"
            ></patterns-selector>
          </template>
        </z-step>
      </z-stepper>
      <!-- TOML -->
      <div class="col-span-4">
        <toml-box
          class="sticky space-y-2 top-32"
          :toml="toml"
          :repoId="repository.id"
          :isCommitPossible="repository.isCommitPossible"
          :actionDisabled="actionDisabled"
          :isAutofixEnabled="repository.isAutofixEnabled"
          :canBeActivated="repository.canBeActivated"
          :isActivated="repository.isActivated"
          :canViewerUpgrade="canViewerUpgrade"
          @activateRepo="activateRepo"
          @toggleNextSteps="showNextStepsModal"
          @commitConfig="commitConfig"
        >
          <template slot="message">
            You'll be adding a
            <span class="font-mono bg-ink-100 rounded-md text-vanilla-100 p-0.5"
              >.deepsource.toml</span
            >
            file in the repository's root folder.
          </template>
        </toml-box>
      </div>
      <portal to="modal">
        <next-steps-modal
          v-if="showNextSteps"
          @close="showNextSteps = false"
          @activate="activateRepo"
          :actionDisabled="actionDisabled"
          :showModal="showNextSteps"
        ></next-steps-modal>
      </portal>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { ZIcon, ZStepper, ZStep, ZInput, ZTag, ZButton } from '@deepsourcelabs/zeal'
import { TomlBox, AnalyzerSelector, PatternsSelector } from '@/components/ConfigGenerator'
import InstallAutofixModal from '@/components/Autofix/Modals/InstallAutofixModal.vue'
import { NextStepsModal } from '@/components/ConfigGenerator'

// mixins
import RouteParamsMixin from '@/mixins/routeParamsMixin'
import TomlGeneratorMixin from '@/mixins/tomlGeneratorMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RepoListMixin from '~/mixins/repoListMixin'

// Utils
import { toTitleCase } from '@/utils/string'

// Store
import { TransformerInterface } from '~/store/analyzer/list'
import { AnalyzerListActions } from '~/store/analyzer/list'
import { DirectoryGetters } from '~/store/directory/directory'
import { RepoConfigInterface, RepoConfigAnalyzerMeta } from '~/store/repository/detail'

import { RepoPerms, TeamPerms } from '~/types/permTypes'
import { Analyzer, TransformerTool } from '~/types/types'

const analyzerListStore = namespace('analyzer/list')
const directoryStore = namespace('directory/directory')

/**
 * Building the UI
 * 1. Fetch Repo with Config
 * 2. Save config to `userConfig`, this is passed across the components
 *    and updated throughtout the lifecycle
 * 3. Generate TOML using a computed method from `userConfig`
 *
 * AnalyzerSelector Component
 * It accepts the `userConfig`, builds the list and search for the analyzers
 * and emits the following events to update `userConfig`
 * 1. updateConfig: Add, update or deleted analyzers from `userConfig`
 * 2. updateTransformers: Update the entire `transformers` array in userConfig
 *
 * PatternSelector Component
 * It accepts the `test_patterns` and `exclude_patterns` directly from `userConfig`
 * attaches them to their respective text boxes and emits an event `updatePatterns`
 * with an object consisting both `test_pattern` and `exclude_pattern`
 *
 * TomlGeneratorMixin
 * This is a Mixin that has all the methods to generator TOML from `userConfig`
 * **/

@Component({
  components: {
    ZIcon,
    ZStepper,
    ZStep,
    ZInput,
    ZTag,
    ZButton,
    TomlBox,
    AnalyzerSelector,
    PatternsSelector,
    InstallAutofixModal,
    NextStepsModal
  },
  layout: 'sidebar-only'
})
export default class GenerateConfig extends mixins(
  RouteParamsMixin,
  TomlGeneratorMixin,
  RepoDetailMixin,
  RoleAccessMixin,
  RepoListMixin
) {
  @directoryStore.Getter(DirectoryGetters.DIRECTORY_ANALYZERS)
  analyzerList: Analyzer[]

  @directoryStore.Getter(DirectoryGetters.DIRECTORY_TRANSFORMERS)
  transformerList: TransformerTool[]

  @analyzerListStore.Action(AnalyzerListActions.CHECK_ANALYZER_EXISTS)
  checkAnalyzerExists: (arg?: { shortcode: string }) => Promise<boolean>

  @analyzerListStore.Action(AnalyzerListActions.CHECK_TRANSFORMER_EXISTS)
  checkTransformerExists: (arg?: {
    shortcode: string
    analyzerShortcode: string
  }) => Promise<boolean>

  public userConfig: RepoConfigInterface = {
    version: 1,
    analyzers: [],
    transformers: [],
    test_patterns: [],
    exclude_patterns: []
  }

  public showInstallAutofixAppModal = false
  public showNextSteps = false
  public isProcessing = false

  showNextStepsModal() {
    const selector = this.$refs['analyzer-selector'] as AnalyzerSelector
    const isConfigValid = selector.validateConfig()
    if (isConfigValid) {
      this.showNextSteps = true
      return
    }

    this.$toast.danger(
      "Your configuration is invalid, please ensure you've filled all required fields"
    )
  }

  async fetch(): Promise<void> {
    await this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
    await this.fetchIsCommitPossible(this.baseRouteParams)
    await this.fetchRepoDetails(this.baseRouteParams)
    await this.fetchRepoPerms(this.baseRouteParams)
    // create a deep copy, this is safe enough for now
    // deep copy to avoid mutating the state directly
    this.userConfig = Object.assign(
      this.userConfig,
      JSON.parse(JSON.stringify(this.repository.config))
    )
    //? Pre-select an analyzer if shortcode is present in url
    const presetAnalyzer = this.$route.query['preset-analyzer'] as string
    if (typeof presetAnalyzer === 'string' && presetAnalyzer) {
      this.isProcessing = true
      const analyzerInStore = this.analyzerList.find(
        (analyzer: Analyzer) => analyzer.shortcode === presetAnalyzer
      )
      let analyzerExists = false
      if (!analyzerInStore) {
        analyzerExists = await this.checkAnalyzerExists({
          shortcode: presetAnalyzer.toString()
        })
      }
      if (analyzerInStore || analyzerExists) {
        this.updateAnalyzerConfig({
          name: this.$route.query['preset-analyzer'].toString(),
          meta: {},
          enabled: true
        })
        //? Pre-select an transformer if shortcode is present in url
        const presetTransformer = this.$route.query['preset-transformer'] as string
        if (
          typeof presetTransformer === 'string' &&
          presetTransformer &&
          this.repository.isAutofixEnabled
        ) {
          this.isProcessing = true
          const transformerInStore = this.transformerList.find(
            (transformer: TransformerTool) => transformer.shortcode === presetTransformer
          )
          let transformerExists = false
          if (!transformerInStore) {
            transformerExists = await this.checkTransformerExists({
              shortcode: presetTransformer.toString(),
              analyzerShortcode: presetAnalyzer
            })
          }
          if (transformerInStore || transformerExists) {
            const transformerShortcode = this.$route.query['preset-transformer'].toString()
            const newTransformerObj = {} as Record<string, TransformerInterface>
            newTransformerObj[transformerShortcode] = {
              name: transformerShortcode,
              shortcode: transformerShortcode,
              enabled: true
            }
            this.updateTransformersConfig(newTransformerObj)
          }
        }
      }
    }
    this.isProcessing = false
  }

  async activateRepo(): Promise<void> {
    await this.toggleRepoActivation({
      id: this.repository.id,
      isActivated: true
    })
    await this.routeToRepoHome()
  }

  async commitConfig(createPullRequest = false): Promise<void> {
    const selector = this.$refs['analyzer-selector'] as AnalyzerSelector
    const pullLabel = this.$route.params.provider === 'gl' ? 'merge' : 'pull'
    const isConfigValid = selector.validateConfig()
    if (isConfigValid) {
      const args = {
        config: this.toml,
        repositoryId: this.repository.id,
        createPullRequest
      }

      try {
        const response = await this.commitConfigToVcs(args)
        if (response.ok) {
          await this.routeToRepoHome()
          if (createPullRequest) {
            this.$toast.show({
              type: 'success',
              message: `<p>We have created a ${pullLabel} request with the configuration.</p><p class="mt-1">Analysis will start automatically once you merge the ${pullLabel} request.</p>`,
              timeout: 5
            })
          } else {
            this.$toast.success(
              `Successfully activated ${this.repository.name}, the first run may take a while to finish`
            )
          }
        } else {
          this.$toast.danger(
            'Something went wrong while creating the configuration for this repository, contact support'
          )
        }
      } catch (e) {
        this.logSentryErrorForUser(e, 'Generate config', args)
        this.$toast.danger(e.message.replace('GraphQL error: ', ''))
      } finally {
        this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
      }
    }
  }

  async routeToRepoHome(): Promise<void> {
    await this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })
    this.fetchRepoDetails({
      ...this.baseRouteParams,
      refetch: true
    })

    const { owner, provider } = this.$route.params

    this.fetchActiveAnalysisRepoList({
      login: owner,
      provider,
      limit: 10,
      refetch: true
    })

    this.$router.push(this.$generateRoute([]))
  }

  head(): Record<string, string> {
    return {
      title: `Generate Config - ${toTitleCase(this.repo)}`
    }
  }

  get toml(): string {
    return this.tomlTemplate(
      this.userConfig,
      this.userConfig['test_patterns'],
      this.userConfig['exclude_patterns']
    )
  }

  get actionDisabled(): boolean {
    if (this.repository.isActivated || this.repository.canBeActivated) {
      return this.userConfig.analyzers.length ? false : true
    }
    return true
  }

  get canViewerUpgrade(): boolean {
    return this.$gateKeeper.team(TeamPerms.CHANGE_PLAN, this.teamPerms.permission)
  }

  updateAnalyzerConfig(newConfig: RepoConfigAnalyzerMeta): void {
    if (newConfig.enabled) {
      const analyzerIndex = this.userConfig.analyzers.findIndex((conf) => {
        return conf.name === newConfig.name
      })

      if (analyzerIndex >= 0) {
        // Assign to analyzers to trigger computed value
        this.userConfig.analyzers = this.userConfig.analyzers.map((conf) => {
          if (conf.name === newConfig.name) {
            return Object.assign(conf, newConfig)
          }
          return conf
        })
      } else {
        // move to top
        this.userConfig.analyzers.unshift(newConfig)
      }
    } else {
      this.userConfig.analyzers = this.userConfig.analyzers.filter(
        (conf) => conf.name !== newConfig.name
      )
    }
  }

  updateTransformersConfig(updatedTransformers: Record<string, TransformerInterface>): void {
    Object.keys(updatedTransformers).forEach((transformerName) => {
      const transformerObj = updatedTransformers[transformerName]
      const transformerIndex = this.userConfig.transformers.findIndex((conf) => {
        return conf.name === transformerName
      })

      if (transformerIndex >= 0) {
        this.userConfig.transformers = this.userConfig.transformers.map((transformer) => {
          if (Object.keys(updatedTransformers).includes(transformer.name)) {
            return updatedTransformers[transformer.name]
          }
          return transformer
        })
      } else {
        this.userConfig.transformers.push(transformerObj)
      }
    })

    this.userConfig.transformers = this.userConfig.transformers.filter(
      (transformer) => transformer.enabled
    )
  }

  updatePatternsConfig(patterns: Record<string, string[]>): void {
    Object.assign(this.userConfig, patterns)
  }

  get canEnableAutofix(): boolean {
    return this.$gateKeeper.repo(RepoPerms.INSTALL_AUTOFIX_APP, this.repoPerms.permission)
  }
}
</script>
<style>
.z-step__main {
  @apply w-full;
}
</style>
