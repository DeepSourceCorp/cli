<template>
  <z-modal width="custom" title="Customize overview widgets" @onClose="$emit('close')">
    <section class="hide-scroll max-h-98 space-y-2 overflow-y-auto p-4 sm:w-98 md:h-98">
      <z-input
        v-model="searchCandidate"
        class="mb-4 flex-grow"
        size="small"
        :show-border="false"
        background-color="ink-200"
        placeholder="Search for a widget..."
      >
        <template #left>
          <z-icon icon="search" size="small" class="ml-1.5" />
        </template>
      </z-input>
      <draggable
        v-show="enabledWidgetsSearchResults.length"
        key="enabled-widgets"
        :list="enabledWidgets"
        :animation="200"
        ghost-class="bg-ink-300"
        tag="ul"
        class="grid grid-cols-1 gap-2"
        filter=".ignore-element"
        handle=".drag-handler"
        @start="dragging = true"
        @end="dragging = false"
      >
        <customize-widget-modal-row
          v-for="widget in enabledWidgetsSearchResults"
          :key="widget"
          v-model="enabledWidgets"
          :icon="WIDGET_ICON_MAP[widget]"
          :widget-name="widget"
          :title="repository.allWidgets[widget].title"
        />
      </draggable>
      <ul class="grid grid-cols-1 gap-2">
        <customize-widget-modal-row
          v-for="widget in availableWidgetsSearchResults"
          :key="widget"
          v-model="enabledWidgets"
          :icon="WIDGET_ICON_MAP[widget]"
          :widget-name="widget"
          :draggable="false"
          :title="repository.allWidgets[widget].title"
        />
      </ul>
      <empty-state
        v-if="
          enabledWidgetsSearchResults.length === 0 && availableWidgetsSearchResults.length === 0
        "
        subtitle="No widgets matched the search term"
      />
    </section>
    <template #footer="{ close }">
      <div
        class="flex items-center justify-between space-x-4 border-t border-slate-400 px-4 py-3 text-vanilla-100"
      >
        <span v-if="enabledWidgets.length < MIN_WIDGETS" class="text-xs font-medium text-honey">
          You need to select at least {{ MIN_WIDGETS }} widgets
        </span>
        <span
          v-else-if="enabledWidgets.length > MAX_WIDGETS"
          class="text-xs font-medium text-honey"
        >
          You can only select at most {{ MAX_WIDGETS }} widgets
        </span>
        <span v-else class="text-xs font-medium text-juniper"
          >{{ MAX_WIDGETS - enabledWidgets.length }} remaining</span
        >
        <z-button
          icon="check"
          size="small"
          :is-loading="savingPreferences"
          loading-label="Updating Widgets"
          :disabled="enabledWidgets.length > MAX_WIDGETS || enabledWidgets.length < MIN_WIDGETS"
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
import { ZIcon, ZButton, ZModal, ZTag, ZCheckbox, ZInput } from '@deepsource/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import Draggable from 'vuedraggable'

const MAX_WIDGETS = 8
const MIN_WIDGETS = 4

@Component({
  components: {
    ZIcon,
    ZButton,
    ZModal,
    ZTag,
    ZCheckbox,
    ZInput,
    Draggable
  },
  layout: 'dashboard'
})
export default class CustomizeWidgetsModal extends mixins(RepoDetailMixin) {
  public enabledWidgets: string[] = []
  public dragging = false
  public savingPreferences = false
  public searchCandidate = ''
  public MAX_WIDGETS = MAX_WIDGETS
  public MIN_WIDGETS = MIN_WIDGETS

  WIDGET_ICON_MAP = {
    'ddp-widget': 'direct-dependency',
    'idp-widget': 'indirect-dependency',
    'lcv-widget': 'test-coverage-2',
    'bcv-widget': 'branch-coverage',
    'dcv-widget': 'documentation-coverage',
    'bug-risk-widget': 'bug-risk',
    'antipattern-widget': 'antipattern',
    'style-widget': 'style',
    'security-widget': 'security',
    'performance-widget': 'performance',
    'doc-widget': 'doc',
    'typecheck-widget': 'typecheck',
    'coverage-widget': 'coverage'
  }

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

  get allowPop(): boolean {
    return this.enabledWidgets.length > this.MIN_WIDGETS
  }

  get allowPush(): boolean {
    return this.enabledWidgets.length < this.MAX_WIDGETS
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
