<template>
  <main class="flex max-w-2xl flex-col gap-y-2 p-4">
    <page-title
      title="Analysis configuration"
      description-width-class="max-w-2xl"
      class="max-w-2xl"
    >
      <template #description>
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
        <z-radio-button v-tooltip="'View as cards'" value="cards">
          <z-icon icon="layers" />
        </z-radio-button>
        <z-radio-button v-tooltip="'View toml'" value="toml">
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
        v-for="analyzer in analyzersInConfig"
        :key="analyzer.shortcode"
        class="z-20"
        :read-only="true"
        v-bind="analyzer"
        :analyzer-logo="analyzer.analyzerLogo"
        :available-transformers="analyzer.transformers"
        :analyzer-meta="analyzer.meta"
        :selected-analyzer="getConfig(analyzer.shortcode)"
        :selected-transformers="userConfig.transformers"
        :collapsible="false"
      />
    </section>
    <section v-else class="toml-box hide-scroll overflow-x-scroll rounded-sm bg-ink-300 text-sm">
      <div class="sticky left-0 top-0 flex items-center justify-between space-x-2 bg-ink-200 p-3">
        <code class="font-bold text-vanilla-200">.deepsource.toml</code>
        <copy-button
          v-tooltip="{
            placement: 'top',
            content: 'Copy to clipboard',
            delay: { show: 700, hide: 100 },
            classes: 'shadow-lg'
          }"
          :value="toml"
          :disabled="!toml"
          button-type="ghost"
          :icon-only="true"
          class="hover:bg-vanilla-400 hover:bg-opacity-5"
        />
      </div>
      <div class="bg-ink-300 p-3 text-sm">
        <highlightjs language="toml" :code="toml" />
      </div>
    </section>
  </main>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { RepoPerms } from '~/types/permTypes'
import TomlGeneratorMixin from '~/mixins/tomlGeneratorMixin'
import AnalyzerListMixin from '~/mixins/analyzerListMixin'
import { RepoConfigAnalyzerMeta, RepoConfigInterface } from '~/store/repository/detail'
import { AnalyzerInterface } from '~/store/analyzer/list'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

@Component({
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
}
</script>
