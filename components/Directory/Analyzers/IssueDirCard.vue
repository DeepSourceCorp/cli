<template>
  <nuxt-link
    :to="analyzerUrl ? `${analyzerUrl}/issues/${issue.shortcode}` : '#'"
    class="rounded-md border border-ink-200 px-4 py-3 hover:bg-ink-300 hover:cursor-pointer"
  >
    <div>
      <h6 class="font-semibold text-lg">
        <span>{{ issue.title }}</span
        ><span class="text-vanilla-400 ml-2 font-normal text-sm">{{ issue.shortcode }}</span>
      </h6>
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
    </div>
  </nuxt-link>
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
