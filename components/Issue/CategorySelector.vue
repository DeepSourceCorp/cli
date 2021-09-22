<template>
  <div class="hidden border-r border-ink-200 space-y-1 lg:flex flex-col justify-between">
    <!-- Issue Types View -->
    <section class="p-2 space-y-1">
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
          class="group-hover:bg-ink-200 xl:text-sm"
          text-size="xs"
          spacing="py-0.5 px-2"
          :bg-color="issueType.shortcode === modelValue ? 'ink-200' : 'ink-300'"
          >{{ issueType.count }}</z-tag
        >
      </div>
    </section>
    <slot name="cta"></slot>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ModelSync } from 'vue-property-decorator'

import { ZIcon, ZTag } from '@deepsourcelabs/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

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
  'style',
  'security',
  'performance',
  'doc',
  'typecheck',
  'coverage'
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
