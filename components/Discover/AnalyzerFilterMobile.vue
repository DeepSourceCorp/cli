<template>
  <div>
    <div class="absolute z-20 flex justify-center w-screen p-3 pb-5 filter-wrapper md:hidden">
      <z-button
        button-type="primary"
        @click="isModalOpen = true"
        class="flex items-center min-w-48"
      >
        <template v-if="currentAnalyzer">
          <img
            v-if="currentAnalyzer.analyzerLogo"
            :src="currentAnalyzer.analyzerLogo"
            :alt="currentAnalyzer.name"
            class="flex-shrink-0 w-auto h-4"
          />
          <span class="text-sm leading-none">{{
            currentAnalyzer.name.replace(' (beta)', '')
          }}</span>
        </template>
        <span v-else class="text-sm leading-none">All repositories</span>
      </z-button>
    </div>
    <portal to="modal">
      <z-modal v-if="isModalOpen" title="Filter by technology" @onClose="isModalOpen = false">
        <div class="grid grid-cols-2 gap-2 px-3 py-4">
          <template v-for="analyzer in analyzerList">
            <nuxt-link
              v-if="!['test-coverage', 'secrets'].includes(analyzer.shortcode)"
              :key="analyzer.id"
              class="inline-flex items-center justify-center p-2 space-x-1 text-sm rounded-md cursor-pointer"
              :class="[
                $route.params.lang === analyzer.shortcode
                  ? 'bg-gradient-dawn'
                  : 'bg-ink-200 hover:bg-ink-100 bg-opacity-80 text-vanilla-400'
              ]"
              :to="
                $route.params.lang === analyzer.shortcode
                  ? `/discover`
                  : `/discover/${analyzer.shortcode}`
              "
              role="button"
            >
              <img
                v-if="analyzer.analyzerLogo"
                :src="analyzer.analyzerLogo"
                :alt="analyzer.name"
                class="flex-shrink-0 w-auto h-4"
              />
              <span class="text-xs"> {{ analyzer.name }} </span>
            </nuxt-link>
          </template>
        </div>
      </z-modal>
    </portal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZModal } from '@deepsourcelabs/zeal'

import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { Analyzer, Maybe } from '~/types/types'

const directoryStore = namespace('directory/directory')

@Component({
  components: { ZButton, ZIcon, ZModal }
})
export default class AnalyzerFilterMobile extends Vue {
  isModalOpen = false
  activeFilterTitle = ''

  @directoryStore.Getter(DirectoryGetters.DIRECTORY_ANALYZERS)
  analyzerList: Analyzer[]

  @directoryStore.Action(DirectoryActions.FETCH_ANALYZER_DIR_LIST)
  fetchAnalyzers: () => Promise<void>

  mounted() {
    let vh = window.innerHeight
    document.documentElement.style.setProperty('--window-inner-height', `${vh}px`)
  }

  get currentAnalyzer(): Maybe<Analyzer> {
    const { lang } = this.$route.params
    if (lang) {
      const analyzer = this.analyzerList.filter((analyzer) => analyzer.shortcode === lang)
      if (Array.isArray(analyzer) && analyzer.length) {
        return analyzer[0]
      }
    }
    return null
  }

  async fetch(): Promise<void> {
    await this.fetchAnalyzers()
  }
}
</script>
<style scoped>
.filter-wrapper {
  bottom: 0px;
  bottom: calc(100vh - var(--window-inner-height, 1vh));
}
</style>
