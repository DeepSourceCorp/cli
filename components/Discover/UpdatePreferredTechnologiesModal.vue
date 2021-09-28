<template>
  <portal to="modal">
    <z-modal title="Update technology preference" width="wide" @onClose="$emit('close')">
      <div>
        <ul class="grid grid-cols-2 md:grid-cols-3 gap-2 p-6">
          <li
            v-for="analyzer in analyzerList"
            :key="analyzer.name"
            @click="updateTechnologyPreference(analyzer.shortcode)"
            class="flex items-center justify-between px-2 py-2 rounded-md cursor-pointer"
            :class="[
              isFavouriteTechnology(analyzer.shortcode)
                ? 'bg-ink-100'
                : 'bg-ink-200 hover:bg-opacity-90'
            ]"
          >
            <span class="flex items-center space-x-2">
              <analyzer-logo v-bind="analyzer" :hideTooltip="true" />
              <span>{{ analyzer.label }}</span>
            </span>
            <span>
              <img
                v-if="isFavouriteTechnology(analyzer.shortcode)"
                :src="require('~/assets/images/discover/heart-juniper.svg')"
                alt="Favourite"
                class="w-4 h-4"
              />
              <z-icon v-else icon="heart" size="small" />
            </span>
          </li>
        </ul>
      </div>
    </z-modal>
  </portal>
</template>
<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZModal } from '@deepsourcelabs/zeal'
import { AnalyzerInterface, AnalyzerListActions, AnalyzerListGetters } from '~/store/analyzer/list'
import { DiscoverUserGetters, DiscoverUserActions } from '~/store/discover/user'
import { AnalyzerConnection, Maybe, Scalars, UpdateTechnologyPreferenceInput } from '~/types/types'

const analyzerListStore = namespace('analyzer/list')
const discoverUserStore = namespace('discover/user')

@Component({
  components: {
    ZButton,
    ZIcon,
    ZModal
  }
})
export default class UpdatePreferredTechnologies extends Vue {
  @analyzerListStore.Getter(AnalyzerListGetters.ANALYZERS)
  analyzerList: AnalyzerInterface[]

  @analyzerListStore.Action(AnalyzerListActions.FETCH_ANALYZER_LIST)
  fetchAnalyzers: () => Promise<void>

  @discoverUserStore.Getter(DiscoverUserGetters.GET_PREFERRED_TECHNOLOGIES)
  preferredTechnologies: AnalyzerConnection

  @discoverUserStore.Action(DiscoverUserActions.FETCH_PREFERRED_TECHNOLOGIES)
  fetchPreferredTechnologies: (args?: { refetch?: boolean }) => Promise<void>

  @discoverUserStore.Action(DiscoverUserActions.UPDATE_PREFERRED_TECHNOLOGIES)
  updatePreferredTechnologies: (args: { input: UpdateTechnologyPreferenceInput }) => Promise<void>

  async fetch() {
    await Promise.all([this.fetchAnalyzers(), this.fetchPreferredTechnologies()])
  }

  getUserPreferredTechnologies() {
    return this.preferredTechnologies.edges.map((edge) => edge?.node?.shortcode) as Maybe<string>[]
  }

  isFavouriteTechnology(shortcode: Scalars['String']): boolean {
    const userPreferredTechnologies = this.getUserPreferredTechnologies()
    return userPreferredTechnologies.includes(shortcode)
  }

  async updateTechnologyPreference(shortcode: Scalars['String']): Promise<void> {
    let analyzerShortcodes = []
    const userPreferredTechnologies = this.getUserPreferredTechnologies()

    if (this.isFavouriteTechnology(shortcode)) {
      const shortcodeIdx = userPreferredTechnologies.indexOf(shortcode)
      analyzerShortcodes = userPreferredTechnologies.filter((_, idx) => idx !== shortcodeIdx)
    } else {
      analyzerShortcodes = [...userPreferredTechnologies, shortcode]
    }
    await this.updatePreferredTechnologies({
      input: { analyzerShortcodes }
    })
  }

  closeModal(): void {
    this.$emit('close')
  }
}
</script>
