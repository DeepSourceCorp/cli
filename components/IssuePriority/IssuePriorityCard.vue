<template>
  <base-card :remove-default-style="true" custom-padding="pb-3 pr-3 pt-2">
    <template slot="title">
      <p class="text-sm font-semibold text-vanilla-300">
        <span v-html="escapeHtml(title)" />
        <span class="ml-1 text-xs font-normal text-vanilla-400 whitespace-nowrap"
          >{{ shortcode }}
        </span>
      </p>
    </template>

    <template slot="description">
      <div class="flex flex-wrap text-xs gap-x-4">
        <!-- Priority type -->
        <priority-type-select
          v-if="canChangePriority"
          :priority="priority"
          @priority-changed="$emit('priority-edited', $event)"
        />
        <priority-type-badge v-else :priority="priority" />

        <!-- Analyzer type -->
        <div class="flex items-center gap-x-1.5">
          <analyzer-logo v-bind="analyzer" :hide-tooltip="true" size="small" />
          <span class="text-sm tracking-wide capitalize text-vanilla-400">
            {{ analyzer.name }}
          </span>
        </div>

        <!-- Issue type -->
        <issue-type :issue-type="issueType"></issue-type>
      </div>
    </template>

    <template v-if="canChangePriority" slot="info">
      <div class="flex justify-end h-full mt-1">
        <z-button
          v-tooltip="`Remove priority assignment`"
          size="small"
          button-type="ghost"
          icon="minus-circle"
          color="cherry"
          data-testid="unset-issue-priority"
          @click="$emit('priority-unset', shortcode)"
        />
      </div>
    </template>
  </base-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { BaseCard } from '@/components/History'
import PriorityTypeSelect from './PriorityTypeSelect.vue'
import PriorityTypeBadge from './PriorityTypeBadge.vue'
import AnalyzerLogo from '~/components/AnalyzerLogo.vue'
import IssueType from '@/components/Repository/IssueType.vue'
import { ZTag, ZIcon, ZButton } from '@deepsourcelabs/zeal'
import { escapeHtml } from '~/utils/string'
import { Analyzer } from '~/types/types'

/**
 * card component for showing issue details along with its priority.
 */
@Component({
  name: 'IssuePriorityCard',
  components: {
    BaseCard,
    ZTag,
    ZIcon,
    ZButton,
    PriorityTypeSelect,
    PriorityTypeBadge,
    IssueType,
    AnalyzerLogo
  },
  methods: {
    escapeHtml
  }
})
export default class IssuePriorityCard extends Vue {
  @Prop({ default: '' })
  title!: string

  @Prop({ default: '' })
  shortcode!: string

  @Prop({ default: '' })
  priority!: string

  @Prop()
  analyzer!: Analyzer

  @Prop({ default: '' })
  issueType!: string

  @Prop({ default: false })
  canChangePriority!: boolean
}
</script>
