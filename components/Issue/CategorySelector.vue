<template>
  <div class="flex-col hidden p-2 space-y-4 border-r border-slate-400 lg:flex">
    <!-- Issue Types View -->
    <slot name="cta"></slot>
    <section class="flex-shrink space-y-1 overflow-y-scroll hide-scroll">
      <div
        v-for="issueType in issueCategories"
        :key="issueType.shortcode"
        :class="{
          'bg-ink-300': issueType.shortcode === modelValue
        }"
        class="flex items-center p-2 space-x-2 rounded-sm cursor-pointer group hover:bg-ink-300"
        @click="modelValue = issueType.shortcode"
      >
        <z-icon
          :icon="issueType.icon"
          :color="issueType.shortcode === modelValue ? 'vanilla-100' : 'slate'"
          class="group-hover:text-vanilla-100"
        />
        <span
          :class="issueType.shortcode === modelValue ? 'text-vanilla-100' : 'text-vanilla-400'"
          class="flex-1 text-sm group-hover:text-vanilla-100"
        >
          {{ issueType.name }}
        </span>
        <z-tag
          v-tooltip="`${issueType.count} occurrences for this category`"
          :bg-color="issueType.shortcode === modelValue ? 'ink-200' : 'ink-300'"
          text-size="xs"
          spacing="py-1 px-2"
          class="leading-none group-hover:bg-ink-200"
        >
          <span class="mt-px">{{ formatIntl(issueType.count) }}</span>
        </z-tag>
      </div>
    </section>
  </div>
</template>
<script lang="ts">
import { ZIcon, ZTag } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import IssueCategoryMixin from '~/mixins/issueCategoryMixin'
import { formatIntl } from '~/utils/string'

/**
 * Component to add issue filtering based on category for a repo
 */
@Component({
  components: {
    ZIcon,
    ZTag
  },
  methods: {
    formatIntl
  }
})
export default class IssueCategorySelector extends mixins(IssueCategoryMixin) {}
</script>
