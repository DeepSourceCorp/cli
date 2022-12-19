<template>
  <stat-section :title="title" :bodySpacing="0" :bodyIsGrid="false" :helpText="helpText">
    <template slot="controls">
      <slot name="controls"></slot>
    </template>
    <div class="h-full flex flex-col justify-between">
      <div class="flex-grow">
        <slot></slot>
      </div>
    </div>
    <template slot="footer">
      <div v-if="footerLink" class="border-t border-ink-300 flex justify-center">
        <z-button
          :to="footerLink"
          buttonType="ghost"
          size="medium"
          class="text-vanilla-400 h-10"
          :fullWidth="true"
        >
          <div class="text-xs flex items-center leading-none">
            {{ footerLinkLabel }}
            <z-icon
              class="transform-gpu duration-100 group-hover:translate-x-0.5"
              icon="chevron-right"
              size="small"
            ></z-icon>
          </div>
        </z-button>
      </div>
      <div v-if="allowLoadMore" class="border-t border-ink-300 p-2 flex justify-center">
        <div class="group flex items-center space-x-2 cursor-pointer text-vanilla-400 text-sm">
          Load more
          <z-icon icon="chevron-down" size="small"></z-icon>
        </div>
      </div>
    </template>
  </stat-section>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsource/zeal'
import { StatSection } from '@/components/Metrics'

@Component({
  components: { ZButton, ZIcon, StatSection }
})
export default class ListSection extends Vue {
  @Prop({ default: false })
  allowLoadMore: boolean

  @Prop({ default: undefined })
  title: string

  @Prop({ default: undefined })
  helpText: string

  @Prop({ default: undefined })
  footerLink: string

  @Prop({ default: undefined })
  footerLinkLabel: string
}
</script>
