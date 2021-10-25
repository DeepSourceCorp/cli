<template>
  <div class="pb-8">
    <breadcrumb-container :current-item="analyzerName" />

    <hero-header
      :title="analyzerName ? `Discover ${analyzerName} projects` : 'Discover'"
      class="discover-mobile-hero md:discover-hero"
      subtitle="Discover and fix bug risks, anti-patterns, performance issues and security flaws."
    >
      <z-input
        size="large"
        placeholder="Search for a repository, technology, or by language"
        background-color="ink-300"
        v-model="searchTerm"
        :show-border="false"
        :value="searchTerm"
        class="mt-4 rounded-md shadow-lg"
        @debounceInput="$fetch"
      >
        <z-icon icon="search" size="base" color="vanilla-400" class="ml-3 mr-1" slot="left" />
      </z-input>
    </hero-header>

    <!-- Layout for larger screens -->
    <div class="hidden md:grid text-vanilla-100">
      <div class="grid gap-4 px-4 grid-cols-discover">
        <!-- Discover repo feed -->
        <repo-feed :loading="$fetchState.pending" />
        <section class="space-y-4">
          <!-- Editor's pick repository -->
          <div class="sticky top-0">
            <editors-pick />
            <!-- Trending repositories -->
            <trending />
          </div>
        </section>
      </div>
    </div>

    <!-- Mobile layout -->
    <div class="flex flex-col items-center md:hidden">
      <z-tabs class="w-full -mb-px">
        <div class="flex justify-between px-4 border-b border-ink-200">
          <z-tab-list class="flex pt-4 space-x-4 overflow-auto sm:w-auto hide-scroll">
            <z-tab-item class="flex items-center flex-shrink-0" icon="tachometer-fast">
              <span>Recommended Projects</span>
            </z-tab-item>
            <z-tab-item class="flex items-center flex-shrink-0" icon="trending-up">
              <span>Trending</span>
            </z-tab-item>
          </z-tab-list>
        </div>

        <z-tab-panes class="px-4 pt-4 min-h-48">
          <!-- Discover repo feed -->
          <repo-feed :loading="loading" />

          <z-tab-pane>
            <!-- Editor's pick repository -->
            <editors-pick class="mb-2" />
            <!-- Trending repositories -->
            <trending />
          </z-tab-pane>
        </z-tab-panes>
      </z-tabs>
    </div>
    <analyzer-filter-mobile />
  </div>
</template>

<script lang="ts">
import { ZIcon, ZInput, ZTabItem, ZTabList, ZTabPane, ZTabPanes, ZTabs } from '@deepsourcelabs/zeal'
import { Context } from '@nuxt/types'
import { Component, mixins, namespace } from 'nuxt-property-decorator'

import EditorsPick from '@/components/Discover/EditorsPick.vue'
import Trending from '@/components/Discover/Trending.vue'

import MetaMixin from '~/mixins/metaMixin'

import { AnalyzerListActions } from '~/store/analyzer/list'
import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { DiscoverRepoActions, DiscoverRepoGetters } from '~/store/discover/repositories'
import { Analyzer, Maybe, Repository, RepositoryConnection } from '~/types/types'

const directoryStore = namespace('directory/directory')
const discoverRepositoriesStore = namespace('discover/repositories')

@Component({
  components: {
    ZInput,
    ZIcon,
    ZTabs,
    ZTabList,
    ZTabPane,
    ZTabPanes,
    ZTabItem,
    EditorsPick,
    Trending
  },
  middleware: [
    'disableDiscoverOnPrem',
    async function ({ redirect, route, store }: Context): Promise<void> {
      const allowList = [
        'shell',
        'python',
        'rust',
        'go',
        'java',
        'docker',
        'ruby',
        'javascript',
        'terraform',
        'php',
        'scala',
        'sql'
      ]
      const { lang } = route.params

      // See if it's a standard analyzer
      if (allowList.includes(lang)) {
        return
      }

      // See if it's a blocked analyzer
      const blockList = ['test-coverage', 'secrets']
      if (blockList.includes(lang)) {
        redirect('/discover')
      }

      // fallback
      const analyzerExists = await store.dispatch(
        `analyzer/list/${AnalyzerListActions.CHECK_ANALYZER_EXISTS}`,
        {
          shortcode: lang
        }
      )

      if (!analyzerExists) {
        redirect('/discover')
      }
    }
  ],
  layout: 'discover'
})
export default class Discover extends mixins(MetaMixin) {
  searchTerm = ''
  loading = false
  preferredTechnology: string[] = []

  @directoryStore.Getter(DirectoryGetters.DIRECTORY_ANALYZERS)
  analyzerList: Analyzer[]

  @directoryStore.Action(DirectoryActions.FETCH_ANALYZER_DIR_LIST)
  fetchAnalyzers: () => Promise<void>

  @discoverRepositoriesStore.Action(DiscoverRepoActions.FETCH_DISCOVER_REPOSITORIES)
  fetchDiscoverRepositories: (args?: {
    q: string
    preferredTechnologies: string[]
    limit?: number
    refetch?: boolean
  }) => Promise<void>

  @discoverRepositoriesStore.Getter(DiscoverRepoGetters.GET_DISCOVER_REPOSITORIES)
  discoverRepositories: Maybe<RepositoryConnection>

  @discoverRepositoriesStore.Getter(DiscoverRepoGetters.GET_EDITORS_PICK_REPOSITORY)
  editorsPickRepository: Maybe<Repository>

  async getRepos(): Promise<void> {
    const currentAnalyzerShortcode = this.$route.params.lang

    if (currentAnalyzerShortcode) {
      const idx = this.analyzerList.findIndex(
        (analyzer) => analyzer.shortcode === currentAnalyzerShortcode
      )

      if (idx) {
        this.preferredTechnology = [this.analyzerList[idx].id]
      } else {
        this.preferredTechnology = []
      }
    }

    await this.fetchDiscoverRepositories({
      q: this.searchTerm,
      preferredTechnologies: this.preferredTechnology,
      limit: 100
    })
  }

  get analyzerName(): string {
    const { lang } = this.$route.params
    if (lang) {
      const analyzer = this.analyzerList.filter((analyzer) => analyzer.shortcode === lang)
      if (Array.isArray(analyzer) && analyzer.length) {
        return analyzer[0].name.replace(' (beta)', '')
      }
    }
    return ''
  }

  async fetch(): Promise<void> {
    this.fetchAnalyzers()
    await this.getRepos()

    this.metaTitle = `Discover ${this.analyzerName} • Issues from popular open source projects`
    this.metaDescription =
      'Discover and fix bug risks, anti-patterns, performance issues and security flaws.'
  }
}
</script>

<style scoped>
.discover-mobile-hero {
  background-image: linear-gradient(rgba(22, 24, 29, 0), rgba(22, 24, 29, 0.9)),
    url('~assets/images/discover/discover-mobile-bg.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.discover-mobile-hero-text {
  background: -webkit-linear-gradient(#7a96f2, #ce79d1);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@screen md {
  .discover-mobile-hero-text {
    background: #fff;
    background-clip: text;
    -webkit-background-clip: text;
  }
}

@responsive {
  .discover-hero {
    background-image: linear-gradient(rgba(22, 24, 29, 0), rgba(22, 24, 29, 0.9)),
      url('~assets/images/discover/discover-bg.svg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  }
}
</style>
