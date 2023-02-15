<template>
  <!-- Title -->
  <div>
    <div class="flex items-center justify-between p-4 border-b border-slate-400">
      <h4 class="flex items-center space-x-2 text-md text-vanilla-400">
        <z-icon :icon="repository.isPrivate ? 'z-lock' : 'globe'" size="small"></z-icon>
        <span>
          <nuxt-link :to="['', $route.params.provider, owner].join('/')">{{ owner }}</nuxt-link>
          /
          <b class="text-vanilla-100">{{ repo }}</b>
        </span>
      </h4>
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
          <template #description>
            <!-- Select which analyzer to add -->
            <analyzer-selector
              ref="analyzer-selector"
              :is-processing="isProcessing"
              :user-config="userConfig"
              :disable-analyzer-card-actions="disableAnalyzerCardActions"
              class="mt-2"
              @updateAnalyzers="updateAnalyzerConfig"
              @updateTransformers="updateTransformersConfig"
            ></analyzer-selector>
          </template>
        </z-step>
        <z-step class="w-full">
          <template slot="title">
            <div
              class="flex items-center mt-1 text-xs font-medium leading-snug tracking-wider uppercase text-vanilla-400"
            >
              Patterns
              <z-tag text-size="xxs" spacing="py-1 px-3" class="ml-2 text-vanilla-400"
                >Optional</z-tag
              >
            </div>
          </template>
          <template #description>
            <!-- select patterns -->
            <patterns-selector
              :vcs-url="repository.vcsUrl"
              :test-patterns="userConfig.test_patterns || []"
              :exclude-patterns="userConfig.exclude_patterns || []"
              class="grid grid-cols-1 gap-4 mt-2"
              @updatePatterns="updatePatternsConfig"
            />
          </template>
        </z-step>
      </z-stepper>
      <!-- TOML -->
      <div class="col-span-4">
        <toml-box
          :toml="toml"
          :repo-id="repository.id"
          :is-commit-possible="repository.isCommitPossible"
          :action-disabled="actionDisabled"
          :is-autofix-enabled="repository.isAutofixEnabled"
          :can-be-activated="repository.canBeActivated"
          :is-activated="repository.isActivated"
          :can-viewer-upgrade="canViewerUpgrade"
          class="sticky space-y-2 top-32"
          @activateRepo="activateRepo"
          @toggleNextSteps="showNextStepsModal"
          @commitConfig="commitConfig"
          @commitGSR="handleCommitGSR"
        >
          <template #message>
            You'll be adding a
            <span class="font-mono bg-ink-100 rounded-md text-vanilla-100 p-0.5"
              >.deepsource.toml</span
            >
            file in the repository's root folder.
          </template>
        </toml-box>
      </div>
      <portal to="modal">
        <add-default-branch-modal
          v-if="showAddDefaultBranchModal"
          :login="$route.params.owner"
          :repo-name="repository.name"
          :toml="toml"
          :repo-id="repository.id"
          @onClose="showAddDefaultBranchModal = false"
          @onActivate="showSuccessToast"
        />
        <next-steps-modal
          v-if="showNextSteps"
          :action-disabled="actionDisabled"
          :show-modal="showNextSteps"
          @close="showNextSteps = false"
          @activate="activateRepo"
        ></next-steps-modal>
      </portal>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { ZIcon, ZStepper, ZStep, ZInput, ZTag, ZButton } from '@deepsource/zeal'
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
import { DirectoryGetters } from '~/store/directory/directory'
import { RepoConfigInterface, RepoConfigAnalyzerMeta } from '~/store/repository/detail'

import { RepoPerms, TeamPerms } from '~/types/permTypes'
import { Analyzer, TransformerTool } from '~/types/types'
import AnalyzerListMixin from '~/mixins/analyzerListMixin'

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
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [RepoPerms.ACTIVATE_REPOSITORY]
    }
  },
  layout: 'sidebar-only'
})
export default class GenerateConfig extends mixins(
  RouteParamsMixin,
  TomlGeneratorMixin,
  RepoDetailMixin,
  RoleAccessMixin,
  RepoListMixin,
  AnalyzerListMixin
) {
  @directoryStore.Getter(DirectoryGetters.DIRECTORY_ANALYZERS)
  directoryAnalyzerList: Analyzer[]

  @directoryStore.Getter(DirectoryGetters.DIRECTORY_TRANSFORMERS)
  transformerList: TransformerTool[]

  public userConfig: RepoConfigInterface = {
    version: 1,
    analyzers: [],
    transformers: [],
    test_patterns: [],
    exclude_patterns: []
  }

  showAddDefaultBranchModal = false
  showNextSteps = false
  isProcessing = false
  disableAnalyzerCardActions = false

  showNextStepsModal() {
    const selector = this.$refs['analyzer-selector'] as AnalyzerSelector
    const isConfigValid = selector.validateConfig(false)
    if (isConfigValid) {
      this.showNextSteps = true
      return
    }

    this.$toast.danger(
      "Your configuration is invalid, please ensure you've filled all required fields"
    )
  }

  async fetch(): Promise<void> {
    await Promise.all([
      this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true }),
      this.fetchIsCommitPossible(this.baseRouteParams),
      this.fetchRepoDetails(this.baseRouteParams)
    ])
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
      const analyzerInStore = this.directoryAnalyzerList.find(
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

  showSuccessToast(): void {
    this.$toast.success(
      `Successfully activated ${this.repository.name}, the first run may take a while to finish.`
    )
  }

  async handleCommitGSR(): Promise<void> {
    const selector = this.$refs['analyzer-selector'] as AnalyzerSelector
    const isConfigValid = selector.validateConfig(false)

    if (!isConfigValid) {
      this.$toast.danger(
        "There's something wrong with the repository config, please fill all the necessary details"
      )
    }
    if (this.repository.defaultBranchName) {
      this.commitGSRConfig()
    } else {
      this.showAddDefaultBranchModal = true
    }
  }

  async commitGSRConfig() {
    try {
      await this.triggerGSRActivation({
        config: this.toml,
        defaultBranchName: this.repository.defaultBranchName as string,
        repositoryId: this.repository.id as string
      })

      await this.fetchBasicRepoDetails({
        ...this.baseRouteParams,
        refetch: true
      })

      setTimeout(() => {
        this.$router.push(this.$generateRoute([]))
      }, 500)

      this.showSuccessToast()
    } catch {
      this.$toast.danger(
        'Something went wrong while creating the configuration for this repository, contact support.'
      )
    }
  }

  async commitConfig(createPullRequest = false): Promise<void> {
    this.disableAnalyzerCardActions = true

    const selector = this.$refs['analyzer-selector'] as AnalyzerSelector
    const pullLabel = this.$route.params.provider === 'gl' ? 'merge' : 'pull'
    const isConfigValid = selector.validateConfig(false)
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
        this.logErrorForUser(e as Error, 'Generate config', args)
        this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
      } finally {
        this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true })

        this.disableAnalyzerCardActions = false
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

    this.$router.push(this.$generateRoute(['issues']))
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
    if (this.$config.onPrem && this.$config.gsrEnabled && this.$route.params.provider === 'gsr') {
      return this.userConfig.analyzers.length ? false : true
    }
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
}
</script>
<style>
.z-step__main {
  @apply w-full;
}
</style>
