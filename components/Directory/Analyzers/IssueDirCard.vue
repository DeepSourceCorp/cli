<template>
  <base-card
    :to="analyzerUrl ? `${analyzerUrl}/issues/${issue.shortcode}` : '#'"
    :show-info="false"
  >
    <template #title>
      <h6 class="overflow-hidden cursor-pointer text-vanilla-100 overflow-ellipsis space-x-2">
        <span>{{ issue.title }}</span
        ><span class="text-sm font-normal text-vanilla-400">{{ issue.shortcode }}</span>
      </h6>
    </template>
    <template #description>
      <div class="text-sm text-vanilla-400 flex space-x-5 mt-1">
        <div class="flex space-x-1.5 items-center">
          <z-icon :icon="issue.issueType" size="x-small" color="vanilla-400" />
          <span>{{ issueTypeTitle }}</span>
        </div>
        <div v-if="issue.autofixAvailable" class="flex space-x-1.5 items-center">
          <z-icon icon="autofix" size="x-small" color="vanilla-400" />
          <span>Has Autofix</span>
        </div>
      </div>
      <div
        class="prose text-vanilla-400 text-sm mt-2 max-w-full"
        v-html="issue.shortDescriptionRendered"
      />
    </template>
  </base-card>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { Issue } from '~/types/types'

@Component({
  components: {
    ZIcon
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
