<template>
  <section class="max-w-3xl p-4">
    <div class="flex justify-between mb-4">
      <h2 class="text-lg font-medium">Auto Onboard</h2>
      <z-button
        v-if="configTemplateList.length && allowCrud"
        size="small"
        button-type="primary"
        icon="plus"
        @click="showNewTemplateModal = true"
      >
        Add new template
      </z-button>
      <portal to="modal">
        <new-onboarding-template-modal
          v-if="showNewTemplateModal && allowCrud"
          @close="showNewTemplateModal = false"
        />
      </portal>
    </div>
    <z-input
      v-model="searchCandidate"
      icon="search"
      class="p-2 mb-4"
      :show-border="false"
      background-color="ink-300"
      placeholder="Search templates..."
      @debounceInput="getData"
    >
      <template #left>
        <z-icon icon="search" class="ml-1.5" size="small" />
      </template>
    </z-input>
    <div class="grid grid-cols-1 gap-2">
      <template v-if="templatesLoading">
        <div v-for="index in 3" :key="index" class="h-20 rounded-md bg-ink-300 animate-pulse"></div>
      </template>
      <template v-else-if="configTemplateList.length">
        <config-template-card
          v-for="template in configTemplateList"
          v-bind="template"
          :key="template.shortcode"
          :allow-crud="allowCrud"
          :load-onboarding="
            fetchingRepos && selectedTemplate && selectedTemplate.shortcode === template.shortcode
          "
          @onboard="onboardUsingTemplate"
        />
        <z-pagination
          v-if="pageCount > 1"
          class="flex justify-center"
          :total-pages="pageCount"
          :total-visible="5"
          @selected="updateCurrentPage"
        />
      </template>
      <empty-state
        v-else-if="!searchCandidate"
        use-v2
        show-border
        title="No Auto Onboard templates found"
        :webp-image-path="
          require('~/assets/images/ui-states/auto-onboard/auto-onboard-template-136px.png')
        "
        :png-image-path="
          require('~/assets/images/ui-states/auto-onboard/auto-onboard-template-136px.png')
        "
        subtitle="Auto Onboard helps you activate DeepSource on multiple repositories at once. Ask your organization admin to create a new template."
        content-width="max-w-sm"
      >
        <template #action>
          <z-button v-if="allowCrud" size="small" icon="plus" @click="showNewTemplateModal = true">
            Create a new template
          </z-button>
        </template>
      </empty-state>
      <empty-state
        v-else
        show-border
        :title="`We couldn't find any templates matching &quot;${searchCandidate}&quot;`"
      >
        <template #action>
          <z-button button-type="secondary" size="small" icon="x" @click="searchCandidate = ''">
            Clear search
          </z-button>
        </template>
      </empty-state>
    </div>
    <add-repo-modal
      :current-tab="2"
      :show-modal="showAddRepoModal"
      @close="showAddRepoModal = false"
    />
  </section>
</template>

<script lang="ts">
import { mixins, Component, Watch } from 'nuxt-property-decorator'
import { ZInput, ZIcon, ZButton, ZPagination } from '@deepsource/zeal'
import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import { ConfigTemplate } from '~/types/types'
import { AppFeatures, TeamPerms } from '~/types/permTypes'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({
  components: {
    ZInput,
    ZIcon,
    ZButton,
    ZPagination
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
export default class AutoOnboard extends mixins(AutoOnboardMixin, ActiveUserMixin) {
  public showNewTemplateModal = false
  public showAddRepoModal = false
  public templatesLoading = false
  public fetchingRepos = false
  public searchCandidate = ''

  public pageSize = 25
  public currentPage = 1

  get pageCount(): number {
    if (this.totalTemplates) {
      return Math.ceil(this.totalTemplates / this.pageSize)
    }

    return 0
  }

  get allowCrud() {
    return this.$gateKeeper.team(
      TeamPerms.AUTO_ONBOARD_CRUD_FOR_TEMPLATE,
      this.teamPerms.permission
    )
  }

  updateCurrentPage(pageNumber: number): void {
    this.currentPage = pageNumber
    this.getData()
  }

  async fetch(): Promise<void> {
    this.templatesLoading = true
    await this.getData()
    this.templatesLoading = false
  }

  @Watch('searchCandidate')
  async getData(): Promise<void> {
    const { provider, owner } = this.$route.params
    await this.fetchConfigTemplatesList({
      login: owner,
      provider: provider,
      currentPage: this.currentPage,
      limit: this.pageSize,
      q: this.searchCandidate,
      refetch: true,
      commit: true
    })
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

  async onboardUsingTemplate(config: ConfigTemplate): Promise<void> {
    this.fetchingRepos = true
    await this.fetchRepos()
    this.selectTemplateToOnboard(config)
    this.fetchingRepos = false
    this.showAddRepoModal = true
  }
}
</script>
