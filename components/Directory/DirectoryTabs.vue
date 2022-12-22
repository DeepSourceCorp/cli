<template>
  <div
    class="sticky z-10 flex px-4 pt-3 border-b border-slate-400 gap-x-5 top-23 lg:top-14 bg-ink-400"
  >
    <nuxt-link v-for="(tab, id) in tabList" :key="tab.label" :to="tab.link">
      <z-tab :icon="tab.icon" :isActive="id === activeTab" border-active-color="vanilla-100">
        {{ tab.label }}
      </z-tab>
    </nuxt-link>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

import { ZTab } from '@deepsource/zeal'

interface TabListT {
  label: string
  link: string
  icon: string
}

@Component({
  components: { ZTab },
  name: 'DirectoryTabs'
})
export default class DirectoryTabs extends Vue {
  @Prop({ default: 0 })
  activeTab: number

  @Prop({ default: '#' })
  analyzerUrl: string

  get tabList(): TabListT[] {
    return [
      {
        label: 'Overview',
        link: this.analyzerUrl,
        icon: 'tachometer-fast'
      },
      {
        label: 'Issues',
        link: `${this.analyzerUrl}/issues`,
        icon: 'code'
      }
    ]
  }
}
</script>
