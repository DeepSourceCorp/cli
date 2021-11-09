<template>
  <div id="tabs" class="flex xl:col-span-2 pt-2.5 border-b border-ink-200">
    <div class="flex self-end px-2 space-x-5 overflow-auto md:px-4 flex-nowrap">
      <nuxt-link :to="getRoute('runs')">
        <z-tab border-active-color="vanilla-400" icon="trending-up" :isActive="active == 'runs'">
          Analysis runs
        </z-tab>
      </nuxt-link>
      <nuxt-link :to="getRoute('transforms')">
        <z-tab border-active-color="vanilla-400" icon="zap" :isActive="active == 'transforms'">
          Transforms
        </z-tab>
      </nuxt-link>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZTab } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZTab
  }
})
export default class SubNav extends Vue {
  @Prop({ default: 'runs' })
  public active: string

  getRoute(candidate: string): string {
    return this.$generateRoute(['history', candidate])
  }
}
</script>
