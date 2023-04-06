<template>
  <div class="hidden flex-col justify-between border-r border-slate-400 p-2 lg:flex">
    <!-- Issue Types View -->
    <slot name="cta"></slot>

    <section class="hide-scroll flex-shrink space-y-1 overflow-y-scroll pb-8">
      <div
        v-for="issueType in issueCategories"
        :key="issueType.shortcode"
        class="cursor-pointer text-sm"
      >
        <div
          class="group flex items-center space-x-2 rounded-sm p-2 hover:bg-ink-300"
          :class="{
            'bg-ink-300': issueType.shortcode === activeSidebarItem
          }"
          @click="$emit('update-category', issueType.shortcode)"
        >
          <z-icon
            :icon="issueType.icon"
            :color="issueType.shortcode === activeSidebarItem ? 'vanilla-100' : 'slate'"
            class="group-hover:text-vanilla-100"
          />
          <span
            class="flex-1 group-hover:text-vanilla-100"
            :class="
              issueType.shortcode === activeSidebarItem ? 'text-vanilla-100' : 'text-vanilla-400'
            "
          >
            {{ issueType.name }}
          </span>
          <z-tag
            v-tooltip="`${occurrenceCounts[issueType.shortcode]} occurrences for this category`"
            :bg-color="issueType.shortcode === activeSidebarItem ? 'ink-200' : 'ink-300'"
            text-size="xs"
            spacing="py-1 px-2"
            class="leading-none group-hover:bg-ink-200"
          >
            <span class="mt-px">{{
              shortenLargeNumber(occurrenceCounts[issueType.shortcode])
            }}</span>
          </z-tag>
        </div>

        <div
          v-if="Array.isArray(issueType.subCategories) && issueType.subCategories.length"
          class="mt-1 ml-4 space-y-1 border-l border-slate-300 pl-3"
        >
          <div
            v-for="subCategory in issueType.subCategories"
            :key="subCategory.shortcode"
            class="rounded-sm p-1.5 hover:bg-ink-300 hover:text-vanilla-100"
            :class="
              activeSidebarItem === `${issueType.shortcode}-${subCategory.shortcode}`
                ? 'bg-ink-300 text-vanilla-100'
                : 'text-vanilla-400'
            "
            @click="$emit('update-category', issueType.shortcode, subCategory.shortcode)"
          >
            {{ subCategory.name }}
          </div>
        </div>
      </div>
    </section>

    <slot name="footer"></slot>
  </div>
</template>
<script lang="ts">
import { ZIcon, ZTag } from '@deepsource/zeal'
import { Component, Vue, Prop } from 'nuxt-property-decorator'

import { IssueFilterChoice } from '~/types/issues'
import { shortenLargeNumber } from '~/utils/string'

/**
 * Component to add issue filtering based on category for a repo
 */
@Component({
  components: {
    ZIcon,
    ZTag
  },
  methods: {
    shortenLargeNumber
  }
})
export default class IssueCategorySelector extends Vue {
  @Prop({ default: 'recommended' })
  activeSidebarItem: string

  @Prop({ default: () => [] })
  issueCategories: IssueFilterChoice[]

  @Prop({ default: () => ({}) })
  occurrenceCounts: Record<string, number>
}
</script>
