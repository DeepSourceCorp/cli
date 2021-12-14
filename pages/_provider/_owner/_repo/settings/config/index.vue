<template>
  <main class="flex flex-col max-w-2xl p-4 mb-24 gap-y-2">
    <page-title
      title="Analysis configuration"
      description-width-class="max-w-2xl"
      class="max-w-2xl"
    >
      <template slot="description">
        <p v-if="$route.params.provider !== 'gsr'">
          The analysis configuration for a repository on DeepSource is defined in a
          <code class="font-medium text-vanilla-200">.deepsource.toml</code>
          file in the repository's root. This file must be present at the said location for analysis
          to be run.
        </p>
        <p v-else>
          The analysis configuration for a repository on DeepSource is defined here. Unlike other
          VCS providers, you don't need to store this configuration in your repository.
        </p>
      </template>
    </page-title>

    <section class="flex items-center justify-between">
      <z-radio-group v-model="configMode" class="flex">
        <z-radio-button value="cards" v-tooltip="'View as cards'">
          <z-icon icon="layers" />
        </z-radio-button>
        <z-radio-button value="toml" v-tooltip="'View toml'">
          <z-icon icon="code" />
        </z-radio-button>
      </z-radio-group>
      <nuxt-link v-if="allowConfigGeneration" :to="$generateRoute(['generate-config'])">
        <z-button
          size="small"
          button-type="secondary"
          icon="sliders"
          label="Regenerate configuration"
        />
      </nuxt-link>
    </section>
    <section v-if="configMode === 'cards'" class="space-y-3">
      <analyzer
        class="z-20"
        v-for="analyzer in analyzersInConfig"
        :read-only="true"
        :key="analyzer.shortcode"
        v-bind="analyzer"
        :analyzerLogo="analyzer.analyzerLogo"
        :availableTransformers="analyzer.transformers"
        :analyzerMeta="analyzer.meta"
        :selectedAnalyzer="getConfig(analyzer.shortcode)"
        :selectedTransformers="userConfig.transformers"
        :collapsible="false"
      />
    </section>
    <section v-else class="overflow-x-scroll text-sm rounded-sm toml-box hide-scroll bg-ink-300">
      <div class="sticky top-0 left-0 flex items-center justify-between p-3 space-x-2 bg-ink-200">
        <code class="font-bold text-vanilla-200">.deepsource.toml</code>
        <button
          @click="copyToml"
          v-tooltip="{
            placement: 'top',
            content: 'Copy to clipboard',
            delay: { show: 700, hide: 100 },
            classes: 'shadow-lg'
          }"
          class="p-1 rounded-md cursor-pointer hover:bg-ink-100"
        >
          <z-icon
            :icon="copyIcon"
            :color="copyIconColor"
            class="
              duration-75
              cursor-pointer
              motion-reduce:transition-none motion-reduce:transform-none
            "
          ></z-icon>
        </button>
      </div>
      <div class="p-3 text-sm bg-ink-300">
        <highlightjs language="toml" :code="toml" />
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZRadioGroup, ZRadioButton } from '@deepsourcelabs/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { RepoPerms } from '~/types/permTypes'
import TomlGeneratorMixin from '~/mixins/tomlGeneratorMixin'
import AnalyzerListMixin from '~/mixins/analyzerListMixin'
import { RepoConfigAnalyzerMeta, RepoConfigInterface } from '~/store/repository/detail'
import { AnalyzerInterface } from '~/store/analyzer/list'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

@Component({
  components: {
    ZButton,
    ZIcon,
    ZRadioGroup,
    ZRadioButton
  },
  layout: 'repository',
  middleware: ['validateProvider'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [RepoPerms.READ_REPO]
    }
  }
})
export default class Configuration extends mixins(
  RepoDetailMixin,
  RoleAccessMixin,
  TomlGeneratorMixin,
  AnalyzerListMixin
) {
  public configMode: 'cards' | 'toml' = 'cards'
  public copyIcon = 'clipboard'
  public copyIconColor = 'vanilla-400'

  async fetch(): Promise<void> {
    await Promise.all([
      this.fetchAnalyzers(),
      this.fetchBasicRepoDetails({ ...this.baseRouteParams, refetch: true }),
      this.fetchRepoDetails(this.baseRouteParams)
    ])

    this.userConfig = Object.assign(
      this.userConfig,
      JSON.parse(JSON.stringify(this.repository.config))
    )
  }

  public userConfig: RepoConfigInterface = {
    version: 1,
    analyzers: [],
    transformers: [],
    test_patterns: [],
    exclude_patterns: []
  }

  get analyzersInConfig(): AnalyzerInterface[] {
    const analyzerNames = this.userConfig.analyzers.map((analyzer) => analyzer.name)
    return this.analyzerList
      .filter((config) => analyzerNames.includes(config.name))
      .sort((curr, next) => {
        const currIndex = analyzerNames.indexOf(curr.name)
        const nextIndex = analyzerNames.indexOf(next.name)
        return currIndex - nextIndex
      })
  }

  get toml(): string {
    return this.tomlTemplate(
      this.repository.config,
      this.repository.config['test_patterns'],
      this.repository.config['exclude_patterns']
    )
  }

  get allowConfigGeneration(): boolean {
    return this.$gateKeeper.repo(RepoPerms.ACTIVATE_REPOSITORY, this.repoPerms.permission)
  }

  getConfig(name: string): RepoConfigAnalyzerMeta | Record<string, unknown> {
    const filteredList = this.userConfig.analyzers.filter((config) => config.name === name)
    return filteredList.length ? filteredList[0] : {}
  }

  copyToml(): void {
    this.$copyToClipboard(this.toml)
    this.copyIcon = 'check'
    this.copyIconColor = 'juniper'
    setTimeout(() => {
      this.copyIcon = 'clipboard'
      this.copyIconColor = 'vanilla-400'
    }, 800)
  }
}
</script>
