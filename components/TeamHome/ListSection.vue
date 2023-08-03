<template>
  <stat-section :title="title" :body-spacing="0" :body-is-grid="false" :help-text="helpText">
    <template #controls>
      <slot name="controls"></slot>
    </template>
    <div class="flex h-full flex-col justify-between">
      <div class="flex-grow">
        <slot></slot>
      </div>
    </div>
    <template #footer>
      <div v-if="footerLink" class="flex justify-center border-t border-slate-400">
        <z-button
          :to="footerLink"
          button-type="ghost"
          size="medium"
          class="h-10 text-vanilla-400"
          :full-width="true"
        >
          <div class="flex items-center text-xs leading-none">
            {{ footerLinkLabel }}
            <z-icon
              class="transform-gpu duration-100 group-hover:translate-x-0.5"
              icon="chevron-right"
              size="small"
            />
          </div>
        </z-button>
      </div>
      <div v-if="allowLoadMore" class="flex justify-center border-t border-slate-400 p-2">
        <div class="group flex cursor-pointer items-center space-x-2 text-sm text-vanilla-400">
          Load more
          <z-icon icon="chevron-down" size="small" />
        </div>
      </div>
    </template>
  </stat-section>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { StatSection } from '@/components/Metrics'

@Component({
  components: { StatSection }
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
