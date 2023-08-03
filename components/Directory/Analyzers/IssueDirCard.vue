<template>
  <base-card
    :to="analyzerUrl ? `${analyzerUrl}/issues/${issue.shortcode}` : '#'"
    :show-info="false"
  >
    <template #title>
      <h6 class="cursor-pointer space-x-2 overflow-hidden overflow-ellipsis text-vanilla-100">
        <span v-html="safeRenderBackticks(issue.title)"></span>
        <span class="text-sm font-normal text-vanilla-400">{{ issue.shortcode }}</span>
      </h6>
    </template>
    <template #description>
      <div class="mt-1 flex space-x-5 text-sm text-vanilla-400">
        <div class="flex items-center space-x-1.5">
          <z-icon :icon="issue.issueType" size="x-small" color="vanilla-400" />
          <span>{{ issueTypeTitle }}</span>
        </div>
        <div v-if="issue.autofixAvailable" class="flex items-center space-x-1.5">
          <z-icon icon="autofix" size="x-small" color="vanilla-400" />
          <span>Autofix</span>
        </div>
      </div>
      <div
        class="max-w-full mt-2 text-sm prose-issue-description text-vanilla-400"
        v-html="issue.shortDescriptionRendered"
      ></div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { Issue } from '~/types/types'
import { safeRenderBackticks } from '~/utils/string'

@Component({
  methods: {
    safeRenderBackticks
  },
  name: 'IssueDirCard'
})
export default class IssueDirCard extends Vue {
  @Prop()
  issue!: Issue

  @Prop()
  issueTypeTitle!: string

  @Prop()
  analyzerUrl!: string
}
</script>
