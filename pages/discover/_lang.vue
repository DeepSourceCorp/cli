<template>
  <div class="pb-8">
    <div
      class="flex flex-col items-center md:flex-row md:items-baseline discover-mobile-hero md:discover-hero"
    >
      <div class="px-4 my-8 text-center md:my-10 md:text-left">
        <h1
          class="text-2xl font-bold leading-none md:text-2.5xl discover-mobile-hero-text md:bg-none"
        >
          Discover
        </h1>
        <p class="max-w-md mt-3 md:max-w-2xl md:text-lg text-vanilla-400">
          Discover and fix bug risks, anti-patterns, performance issues and security flaws.
        </p>
        <z-input
          size="large"
          placeholder="Search for a repository, technology, or by language"
          background-color="ink-300"
          v-model="searchTerm"
          :show-border="false"
          :name="searchTerm"
          class="mt-6 rounded-md shadow-lg"
          @debounceInput="$fetch"
        >
          <z-icon icon="search" size="base" color="vanilla-400" class="ml-3 mr-1" slot="left" />
        </z-input>
      </div>
    </div>

    <!-- Layout for larger screens -->
    <div class="hidden md:grid text-vanilla-100">
      <div class="grid gap-4 px-4 grid-cols-discover">
        <!-- Discover repo feed -->
        <repo-feed :loading="loading" />
        <section class="space-y-4">
          <!-- Editor's pick repository -->
          <editors-pick />
          <!-- Trending repositories -->
          <trending />
        </section>
      </div>
    </div>

    <!-- Mobile layout -->
    <div class="flex flex-col items-center md:hidden">
      <z-tabs class="w-full -mb-px">
        <div class="flex justify-between px-4 border-b border-ink-200">
          <z-tab-list class="flex pt-4 space-x-4 overflow-auto sm:w-auto hide-scroll">
            <z-tab-item class="flex items-center flex-shrink-0" icon="rss">
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
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'

import { DiscoverRepoActions, DiscoverRepoGetters } from '~/store/discover/repositories'
import { Analyzer, Maybe, Repository, RepositoryConnection } from '~/types/types'
import { ZIcon, ZInput, ZTabs, ZTabList, ZTabPane, ZTabPanes, ZTabItem } from '@deepsourcelabs/zeal'
import EditorsPick from '@/components/Discover/EditorsPick.vue'
import Trending from '@/components/Discover/Trending.vue'
import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { AnalyzerListActions } from '~/store/analyzer/list'
import { Context } from '@nuxt/types'

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
    async function ({ redirect, route, store }: Context): Promise<void> {
      const { lang } = route.params
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
export default class Discover extends Vue {
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

  mounted(): void {
    this.getRepos()
  }

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
      limit: process.server ? 15 : 100
    })
  }

  async fetch(): Promise<void> {
    this.loading = true
    await this.getRepos()
    this.loading = false
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
