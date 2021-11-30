<template>
  <div class="flex-col hidden p-2 space-y-4 border-r border-ink-200 lg:flex">
    <!-- Issue Types View -->
    <slot name="cta"></slot>
    <section class="flex-shrink space-y-1 overflow-y-scroll hide-scroll">
      <div
        v-for="issueType in issueCategories"
        :key="issueType.shortcode"
        class="flex items-center p-2 space-x-2 rounded-md cursor-pointer group hover:bg-ink-300"
        :class="{
          'bg-ink-300': issueType.shortcode === modelValue
        }"
        @click="modelValue = issueType.shortcode"
      >
        <z-icon
          :icon="issueType.icon"
          size="small"
          :color="issueType.shortcode === modelValue ? 'vanilla-100' : 'slate'"
          class="group-hover:text-vanilla-100"
        ></z-icon>
        <span
          class="flex-1 text-sm group-hover:text-vanilla-100"
          :class="issueType.shortcode === modelValue ? 'text-vanilla-100' : 'text-vanilla-400'"
        >
          {{ issueType.name }}
        </span>
        <z-tag
          v-tooltip="`${issueType.count} occurrences for this category`"
          class="leading-none group-hover:bg-ink-200 tabular-nums"
          text-size="xs"
          spacing="py-1 px-2"
          :bg-color="issueType.shortcode === modelValue ? 'ink-200' : 'ink-300'"
        >
          <span class="mt-px">{{ formatIntl(issueType.count) }}</span>
        </z-tag>
      </div>
    </section>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ModelSync } from 'vue-property-decorator'

import { ZIcon, ZTag } from '@deepsourcelabs/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { formatIntl } from '~/utils/string'

export interface IssueCategoryChoice {
  name: string
  shortcode: string
  icon?: string
}

const issuesSortOrder = [
  'all',
  'recommended',
  'bug-risk',
  'antipattern',
  'security',
  'performance',
  'typecheck',
  'coverage',
  'style',
  'doc'
]

@Component({
  components: {
    ZIcon,
    ZTag
  }
})
export default class IssueCategorySelector extends mixins(RepoDetailMixin) {
  @ModelSync('selectedCategory', 'updateCategory', { type: String, default: 'recommended' })
  readonly modelValue: string

  formatIntl = formatIntl

  iconMap: Record<string, string> = {
    recommended: 'star',
    all: 'all'
  }

  get issueCategories(): IssueCategoryChoice[] {
    if (this.repository.issueTypeDistribution) {
      return this.repository.issueTypeDistribution
        .map(({ name, shortcode, count }) => {
          return {
            name,
            shortcode,
            count,
            icon: this.iconMap[shortcode] ?? shortcode
          }
        })
        .sort((curr, next) => {
          const currIndex = issuesSortOrder.indexOf(curr.shortcode)
          const nextIndex = issuesSortOrder.indexOf(next.shortcode)
          return currIndex - nextIndex
        })
    }

    return []
  }
}
</script>
