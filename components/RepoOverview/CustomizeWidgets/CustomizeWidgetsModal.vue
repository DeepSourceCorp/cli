<template>
  <z-modal width="custom" title="Customize overview widgets" @onClose="$emit('close')">
    <section class="hide-scroll max-h-98 space-y-3 overflow-y-auto p-4 sm:w-98 md:h-98">
      <z-input
        v-model="searchCandidate"
        :show-border="false"
        size="small"
        background-color="ink-200"
        placeholder="Search for a widget..."
      >
        <template #left>
          <z-icon icon="search" size="small" class="ml-1.5" />
        </template>
      </z-input>

      <p
        v-if="showWarning"
        class="rounded-md border border-honey border-opacity-10 bg-honey bg-opacity-10 p-3 text-sm text-honey-400"
      >
        You need to select {{ MAX_WIDGETS_COUNT }} widgets for the dashboard.
      </p>

      <div class="space-y-2">
        <draggable
          v-show="enabledWidgetsSearchResults.length"
          key="enabled-widgets"
          :list="enabledWidgets"
          :animation="200"
          ghost-class="bg-ink-300"
          tag="ul"
          filter=".ignore-element"
          class="grid grid-cols-1 gap-2"
          handle=".drag-handler"
          @start="dragging = true"
          @end="dragging = false"
        >
          <customize-widgets-modal-row
            v-for="widget in enabledWidgetsSearchResults"
            :key="widget"
            v-model="enabledWidgets"
            :icon="WIDGET_ICON_MAP[widget]"
            :is-selected="true"
            :widget-name="widget"
            :title="repository.allWidgets[widget].title"
          />
        </draggable>

        <ul class="grid grid-cols-1 gap-2">
          <customize-widgets-modal-row
            v-for="widget in availableWidgetsSearchResults"
            :key="widget"
            v-model="enabledWidgets"
            :icon="WIDGET_ICON_MAP[widget]"
            :widget-name="widget"
            :draggable="false"
            :title="repository.allWidgets[widget].title"
          />
        </ul>
      </div>

      <empty-state v-if="searchResultIsEmpty" subtitle="No widgets matched the search term" />
    </section>

    <template #footer="{ close }">
      <div
        class="flex items-center justify-between space-x-4 border-t border-slate-400 px-4 py-3 text-vanilla-100"
      >
        <span
          v-if="enabledWidgets.length > MAX_WIDGETS_COUNT"
          class="text-xs font-medium text-honey"
        >
          You can only select {{ MAX_WIDGETS_COUNT }} widgets
        </span>

        <span
          v-else
          class="text-xs font-medium"
          :class="remainingCount <= 3 ? 'text-honey-400' : 'text-juniper'"
          >{{ remainingCount }} remaining</span
        >

        <z-button
          :disabled="enabledWidgets.length !== MAX_WIDGETS_COUNT"
          :is-loading="savingPreferences"
          icon="check"
          size="small"
          loading-label="Updating Widgets"
          @click="savePreferences(close)"
        >
          Update widgets
        </z-button>
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import Draggable from 'vuedraggable'

import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { WIDGET_ICON_MAP } from '~/utils/repository'

@Component({
  components: {
    Draggable
  },
  layout: 'dashboard'
})
export default class CustomizeWidgetsModal extends mixins(RepoDetailMixin) {
  enabledWidgets: string[] = []
  dragging = false
  savingPreferences = false
  searchCandidate = ''
  readonly MAX_WIDGETS_COUNT = 6

  WIDGET_ICON_MAP = WIDGET_ICON_MAP

  async fetch(): Promise<void> {
    await this.fetchWidgets(this.baseRouteParams)
    this.syncWidgets()
  }

  mounted(): void {
    this.syncWidgets()
  }

  syncWidgets(): void {
    if (this.repository?.widgets?.length) {
      this.enabledWidgets = [...this.repository.widgets] as string[]
    }
  }

  get availableWidgets(): string[] {
    return Object.keys(this.repository.allWidgets)
      .filter((widgetName) => !this.enabledWidgets.includes(widgetName))
      .sort()
  }

  get searchResults(): string[] {
    return Object.keys(this.repository.allWidgets).filter((widget: string) => {
      return this.repository.allWidgets[widget].title
        .toLowerCase()
        .includes(this.searchCandidate.toLowerCase())
    })
  }

  get enabledWidgetsSearchResults(): string[] {
    if (this.searchCandidate) {
      return this.enabledWidgets.filter((widgetName) => this.searchResults.includes(widgetName))
    }
    return this.enabledWidgets
  }

  get availableWidgetsSearchResults(): string[] {
    if (this.searchCandidate) {
      return this.availableWidgets.filter((widgetName) => this.searchResults.includes(widgetName))
    }
    return this.availableWidgets
  }

  get remainingCount() {
    return this.MAX_WIDGETS_COUNT - this.enabledWidgets.length
  }

  get searchResultIsEmpty() {
    return (
      this.enabledWidgetsSearchResults.length === 0 &&
      this.availableWidgetsSearchResults.length === 0
    )
  }

  get showWarning() {
    return this.enabledWidgets.length < this.MAX_WIDGETS_COUNT && !this.searchResultIsEmpty
  }

  async savePreferences(close: () => Promise<void>): Promise<void> {
    this.savingPreferences = true
    try {
      await this.updateRepoWidgets({
        repositoryId: this.repository.id,
        widgetCodes: this.enabledWidgets
      })
      await this.fetchWidgets({
        ...this.baseRouteParams,
        refetch: true
      })
      close()
      this.$emit('close')
    } catch (e) {
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.savingPreferences = false
    }
  }
}
</script>
<style>
.enabled-list-enter-active {
  transition: all 300ms;
}
.enabled-list-leave-active {
  transition: all 150ms;
}

.enabled-list-enter,
.enabled-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
