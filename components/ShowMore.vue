<template>
  <div class="flex flex-col space-y-2">
    <div
      class="text-vanilla-400 text-sm transition-max-height duration-300 ease-in-out"
      :class="{
        'line-clamp-5': !readMore,
        'line-clamp-none': readMore
      }"
    >
      <slot>
        {{ content }}
      </slot>
    </div>
    <slot v-if="readMore && labelsVisible" name="show-more-label">
      <z-button buttonType="ghost" size="small" @click="showLessContent">
        <div class="flex items-center space-x-2 text-juniper text-sm">
          <span>Show less</span>
          <z-icon icon="chevron-up" size="small" color="juniper"></z-icon>
        </div>
      </z-button>
    </slot>
    <slot v-if="!readMore && labelsVisible" name="show-less-label">
      <z-button buttonType="ghost" size="small" @click="showMoreContent">
        <div class="flex items-center space-x-2 text-juniper text-sm">
          <span>Show more</span>
          <z-icon icon="chevron-down" size="small" color="juniper"></z-icon>
        </div>
      </z-button>
    </slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon,
    ZButton
  },
  layout: 'repository'
})
export default class ShowMore extends Vue {
  @Prop({ default: '' })
  showMoreLabel!: string
  @Prop({ default: '' })
  showLessLabel!: string
  @Prop({ default: false })
  isReadMore!: boolean
  @Prop({ default: '' })
  content!: string
  @Prop({ default: 0 })
  contentLength!: number
  @Prop({ default: 400 })
  maxLength!: number

  private readMore = this.isReadMore

  private showMoreContent(): void {
    this.readMore = true
  }
  private showLessContent(): void {
    this.readMore = false
  }

  get labelsVisible(): boolean {
    return this.contentLength > this.maxLength
  }
}
</script>
