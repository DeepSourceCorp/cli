<template>
  <div
    class="sticky top-23 z-10 flex gap-x-5 border-b border-slate-400 bg-ink-400 px-4 pt-3 lg:top-14"
  >
    <nuxt-link v-for="(tab, id) in tabList" :key="tab.label" :to="tab.link">
      <z-tab :icon="tab.icon" :is-active="id === activeTab" border-active-color="vanilla-100">
        {{ tab.label }}
      </z-tab>
    </nuxt-link>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

interface TabListT {
  label: string
  link: string
  icon: string
}

@Component({
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
