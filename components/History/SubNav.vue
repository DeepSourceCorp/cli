<template>
  <div id="tabs" class="sub-nav-wrapper flex border-b border-slate-400 xl:col-span-2">
    <div class="flex flex-nowrap space-x-5 self-end overflow-auto px-2 md:px-4">
      <nuxt-link :to="getRoute('runs')">
        <z-tab border-active-color="vanilla-400" icon="trending-up" :is-active="active == 'runs'">
          Analysis runs
        </z-tab>
      </nuxt-link>
      <nuxt-link v-if="showTransforms" :to="getRoute('transforms')">
        <z-tab border-active-color="vanilla-400" icon="zap" :is-active="active == 'transforms'">
          Transforms
        </z-tab>
      </nuxt-link>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class SubNav extends Vue {
  @Prop({ default: 'runs' })
  public active: string

  @Prop({ default: true, type: Boolean })
  showTransforms: boolean

  getRoute(candidate: string): string {
    return this.$generateRoute(['history', candidate])
  }
}
</script>

<style scoped>
.sub-nav-wrapper {
  padding-top: 12.5px;
}
</style>
