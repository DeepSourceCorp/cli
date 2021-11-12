<template>
  <z-modal width="custom" title="Customize overview widgets" @onClose="$emit('close')">
    <section
      class="
        grid grid-cols-1
        gap-2
        px-4
        pt-3
        pb-0
        overflow-y-scroll
        sm:w-98
        md:max-h-98
        hide-scroll
      "
    >
      <z-input
        v-model="searchCandidate"
        class="flex-grow mb-2"
        size="small"
        :show-border="false"
        background-color="ink-200"
        placeholder="Search for a widget..."
      >
        <template slot="left"> <z-icon icon="search" size="small" class="ml-1.5" /> </template>
      </z-input>
      <draggable
        :list="enabledWidgets"
        key="enabled-widgets"
        :animation="200"
        ghost-class="bg-ink-300"
        tag="ul"
        class="grid grid-cols-1 gap-2"
        filter=".ignore-element"
        handle=".drag-handler"
        @start="dragging = true"
        @end="dragging = false"
      >
        <transition-group tag="ul" name="enabled-list" class="grid grid-cols-1 gap-2">
          <customize-widget-modal-row
            v-for="widget in enabledWidgetsSearchResults"
            :key="widget"
            v-model="enabledWidgets"
            :icon="WIDGET_ICON_MAP[widget]"
            :widget-name="widget"
            :title="repository.allWidgets[widget].title"
          />
        </transition-group>
      </draggable>
      <ul class="grid grid-cols-1 gap-2 mb-3">
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
    </section>
    <template v-slot:footer="{ close }">
      <div
        class="
          flex
          items-center
          justify-between
          px-4
          py-3
          space-x-4
          border-t
          text-vanilla-100
          border-ink-200
        "
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
        <span class="text-xs font-medium text-juniper" v-else
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
          Update Widgets
        </z-button>
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZModal, ZTag, ZCheckbox, ZInput } from '@deepsourcelabs/zeal'
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
    'ddp-widget': 'code',
    'idp-widget': 'code',
    'tcv-widget': 'code',
    'bcv-widget': 'code',
    'dcv-widget': 'code',
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
