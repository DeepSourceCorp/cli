<template>
  <div class="flex flex-wrap items-center gap-x-2">
    <analyzer-logo
      v-for="analyzer in initialList"
      :key="analyzer.id"
      v-bind="analyzer"
      size="base"
    />

    <z-menu v-if="othersList.length" direction="left" items-z-class="z-20" width="x-small">
      <template #trigger="{ isOpen, toggle }">
        <z-tag
          :bg-color="isOpen ? 'ink-200' : 'ink-400'"
          text-size="xs"
          spacing="py-1 px-2"
          class="border border-ink-200 hover:cursor-pointer"
          @click.native.stop="toggle"
        >
          +{{ othersList.length }}
        </z-tag>
      </template>

      <template #body>
        <ul class="space-y-3 py-2.5 px-3">
          <li v-for="analyzer in othersList" :key="analyzer.id" class="flex items-center gap-x-2.5">
            <z-icon :icon="analyzer.shortcode" size="x-small" />
            <span>{{ analyzer.name }}</span>
          </li>
        </ul>
      </template>
    </z-menu>
  </div>
</template>

<script lang="ts">
import { ZIcon, ZMenu, ZTag } from '@deepsource/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { Analyzer, AnalyzerConnection } from '~/types/types'
import { resolveNodes } from '~/utils/array'

@Component({ name: 'AnalyzerList', components: { ZIcon, ZMenu, ZTag } })
export default class AnalyzerList extends Vue {
  @Prop()
  availableAnalyzers: AnalyzerConnection

  readonly INITIAL_LIST_COUNT = 4

  get analyzers(): Array<Analyzer> {
    return resolveNodes(this.availableAnalyzers)
  }

  get othersList() {
    return this.analyzers.slice(this.INITIAL_LIST_COUNT)
  }

  get initialList() {
    return this.analyzers.slice(0, this.INITIAL_LIST_COUNT)
  }
}
</script>
