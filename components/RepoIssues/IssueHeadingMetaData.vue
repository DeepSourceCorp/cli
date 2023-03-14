<template>
  <div class="grid grid-cols-2 gap-2 xl:flex space-x-0 xl:space-x-6">
    <!-- Issue type -->
    <issue-type :issue-type="issueType" class="order-1 xl:order-1 uppercase" />
    <!-- Found -->
    <div class="flex items-center space-x-1 order-3 xl:order-1">
      <z-icon icon="file" size="small" color="vanilla-400" />
      <span class="text-sm text-vanilla-400">Found {{ foundDisplay() }}</span>
    </div>
    <!-- Created -->
    <div class="flex items-center space-x-1 order-4 xl:order-1">
      <z-icon icon="clock" size="small" color="vanilla-400" />
      <span class="text-sm text-vanilla-400">Created {{ createdDisplay() }}</span>
    </div>
    <!-- Analyzer Type -->
    <div class="flex items-center space-x-1 order-2 xl:order-1">
      <z-icon :icon="analyzerShortcode" />
      <span class="text-sm">{{ analyzerName }}</span>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'
import IssueType from '@/components/Repository/IssueType.vue'
import { fromNow } from '~/utils/date'

@Component({
  components: {
    ZIcon,
    IssueType
  },
  layout: 'repository'
})
export default class Issues extends Vue {
  @Prop({ default: '' })
  issueType!: string
  @Prop({ default: '' })
  firstSeen!: string
  @Prop({ default: '' })
  lastSeen!: string
  @Prop({ default: '' })
  analyzerName!: string
  @Prop({ default: '' })
  analyzerLogo!: string
  @Prop({ default: '' })
  analyzerShortcode!: string

  public foundDisplay(): string {
    return fromNow(this.lastSeen)
  }

  public createdDisplay(): string {
    return fromNow(this.firstSeen)
  }
}
</script>
