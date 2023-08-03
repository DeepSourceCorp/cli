<template>
  <section>
    <div class="flex min-h-13 flex-row items-center border-b border-slate-400 px-4 py-3.5">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="text-vanilla-400">
          <nuxt-link :to="$generateRoute(['settings', 'auto-onboard'])">All templates</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item>{{ title }}</z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <div v-if="fetchingTemplate" class="max-w-3xl animate-pulse space-y-5 p-4">
      <div class="grid grid-cols-4 gap-2">
        <div class="col-span-2 h-8 bg-ink-300"></div>
        <div></div>
        <div class="h-8 bg-ink-300"></div>
        <div class="col-span-2 h-16 bg-ink-300"></div>
      </div>
      <div class="grid grid-cols-1 gap-4">
        <div class="h-8 bg-ink-300"></div>
        <div class="h-32 bg-ink-300"></div>
        <div class="h-32 bg-ink-300"></div>
      </div>
    </div>
    <div v-else :key="$route.fullPath" class="mb-10 w-full max-w-3xl p-4">
      <page-title :title="title" :description="description">
        <template #actions>
          <template v-if="readOnly">
            <z-button
              v-if="allowEdit"
              size="small"
              button-type="secondary"
              icon="edit"
              @click="readOnly = false"
            >
              Edit
            </z-button>
            <z-button
              size="small"
              button-type="primary"
              :icon-color="fetchingRepos ? 'ink-400 animate-spin' : 'ink-400'"
              :icon="fetchingRepos ? 'spin-loader' : 'fast-forward'"
              @click="onboardUsingTemplate"
            >
              Use this template
            </z-button>
            <add-repo-modal
              :default-active-tab="1"
              :show-modal="showAddRepoModal"
              @close="showAddRepoModal = false"
            />
          </template>
          <template v-else-if="allowEdit">
            <z-button
              v-if="!readOnly"
              v-tooltip="'Discard changes'"
              size="small"
              button-type="ghost"
              icon-color="vanilla-300"
              icon="corner-up-left"
              @click="discardConfig"
            />
            <delete-template-config v-if="!readOnly" :title="title" />
            <save-template-config
              v-if="!readOnly"
              :read-only="readOnly"
              :disabled="selectedAnalyzers.length === 0"
              :title="title"
              :description="description"
              :template-config="templateConfig"
              @refetch="fetchTemplate"
            />
          </template>
        </template>
      </page-title>
      <section class="space-y-4">
        <analyzer-search
          ref="analyzer-search-component"
          :disabled="readOnly || !allowEdit"
          :selected-analyzers="selectedAnalyzers"
          :toggle-search="showAnalyzerList"
          @addAnalyzer="addAnalyzer"
          @closeSearch="showAnalyzerList = false"
        />
        <template v-if="activeAnalyzers.length">
          <analyzer
            v-for="analyzer in activeAnalyzers"
            :key="analyzer.shortcode"
            class="z-20"
            v-bind="analyzer"
            :read-only="readOnly || !allowEdit"
            :for-template="true"
            :analyzer-meta="analyzer.meta"
            :available-transformers="analyzer.transformers"
            :selected-analyzer="getConfig(analyzer.shortcode)"
            :selected-transformers="templateConfig.transformers"
            @onClose="removeAnalyzer(analyzer)"
            @analyzersUpdated="syncAnalyzer"
            @transformersUpdated="syncTransformers"
          />
        </template>
        <empty-state v-else title="Select an analyzer to proceed">
          <template #action>
            <z-button
              ref="add-analyzer-button"
              button-type="secondary"
              icon="plus"
              size="small"
              @click="showAnalyzerList = true"
            >
              Add analyzer
            </z-button>
          </template>
        </empty-state>
      </section>
    </div>
  </section>
</template>

<script lang="ts">
import { Component, mixins, Provide } from 'nuxt-property-decorator'
import { Analyzer } from '@/components/ConfigGenerator'

import { RepoConfigAnalyzerMeta, RepoConfigInterface } from '~/store/repository/detail'
import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ConfigGeneratorMixin from '~/mixins/configGeneratorMixin'
import { AppFeatures, TeamPerms } from '~/types/permTypes'

@Component({
  components: {
    Analyzer
  },
  middleware: ['perm', 'teamOnly', 'validateProvider', 'featureGate'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.AUTO_ONBOARD_CRUD_FOR_TEMPLATE, TeamPerms.AUTO_ONBOARD_VIEW_TEMPLATE]
    },
    gateFeature: AppFeatures.AUTO_ONBOARD
  },
  layout: 'dashboard'
})
export default class NewAutoOnboardTemplate extends mixins(
  AutoOnboardMixin,
  ActiveUserMixin,
  OwnerDetailMixin,
  ConfigGeneratorMixin
) {
  public showAnalyzerList = false
  public title = ''
  public readOnly = true
  public description = ''
  public savingConfig = false
  public fetchingRepos = false
  public showAddRepoModal = false
  public isSaveModalVisible = false
  public fetchingTemplate = false

  mounted(): void {
    this.$root.$on('auto-onboard-config-edit', (targetShortcode: string) => {
      const { shortcode } = this.$route.params
      if (targetShortcode === shortcode && this.allowEdit) {
        this.readOnly = false
      }
    })
  }

  beforeDestroy(): void {
    this.$root.$off('auto-onboard-config-edit')
  }

  get allowEdit(): boolean {
    return this.$gateKeeper.team(
      TeamPerms.AUTO_ONBOARD_CRUD_FOR_TEMPLATE,
      this.teamPerms.permission
    )
  }

  async fetch(): Promise<void> {
    this.fetchingTemplate = true
    await this.fetchTemplate()
    this.fetchingTemplate = false
  }

  async fetchRepos(): Promise<void> {
    const { provider, owner } = this.$route.params
    await this.fetchAutoOnboardableRepoList({
      login: owner,
      provider,
      currentPageNumber: 1,
      limit: 50,
      query: ''
    })
  }

  async onboardUsingTemplate(): Promise<void> {
    this.fetchingRepos = true
    await this.fetchRepos()
    this.selectTemplateToOnboard(this.configTemplate)
    this.fetchingRepos = false
    this.showAddRepoModal = true
  }

  async fetchTemplate(): Promise<void> {
    const { owner, provider, shortcode } = this.$route.params
    await this.fetchAnalyzers()

    await this.fetchSingleTemplate({
      login: owner,
      provider: provider,
      shortcode: shortcode
    })
    this.readOnly = true
    this.loadConfig()
  }

  loadConfig(): void {
    if (this.configTemplate) {
      this.title = this.configTemplate.title
      this.description = this.configTemplate.description

      const config = JSON.parse(this.configTemplate.config)
      this.templateConfig.analyzers = config.analyzers
      this.templateConfig.transformers = config.transformers
    }
  }

  discardConfig(): void {
    this.readOnly = true
    this.loadConfig()
    this.$children.forEach((child) => {
      if (child.$options.name === 'Analyzer') {
        const analyzerComponent = child as Analyzer
        analyzerComponent.generateConfigItems()
        analyzerComponent.generateTransformerItems()
      }
    })
  }

  @Provide()
  validateConfigForAnalyzers(): boolean {
    return this.validateConfig()
  }

  getConfig(shortcode: string): RepoConfigAnalyzerMeta {
    if (this.configTemplate) {
      const config = JSON.parse(this.configTemplate.config) as RepoConfigInterface
      const filteredList = config.analyzers.filter((analyzer) => analyzer.name === shortcode)
      return filteredList.length ? filteredList[0] : ({} as RepoConfigAnalyzerMeta)
    }
    return {} as RepoConfigAnalyzerMeta
  }
}
</script>
