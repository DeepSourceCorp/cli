<template>
  <div class="flex w-11/12 rounded-md bg-ink-300 h-80">
    <section class="w-2/5 p-4 space-y-4 border-r border-ink-200">
      <!-- Avatar and header -->
      <div class="flex items-center space-x-2">
        <!-- Avatar Component -->
        <z-avatar
          v-if="viewer.avatar && viewer.firstName"
          :image="viewer.avatar"
          :fallback-image="getDefaultAvatar(viewer.email)"
          :user-name="viewer.firstName"
          size="sm"
        >
        </z-avatar>
        <z-avatar v-else :loading="true" user-name="loading" size="md"> </z-avatar>
        <!-- Handle Name -->
        <div
          class="flex items-center space-x-2 text-base font-medium cursor-pointer text-vanilla-200"
        >
          {{ viewer.firstName || viewer.email }}
          <z-icon icon="chevron-down" size="small" color="vanilla-200"></z-icon>
        </div>
      </div>
      <!-- Blank space -->
      <div class="w-full p-10 rounded-md bg-ink-200"></div>
      <!-- Start analysing menu -->
      <div class="space-y-2">
        <div class="flex items-center space-x-1">
          <z-icon icon="activity" size="x-small" class="flex-shrink-0 mr-1"></z-icon>
          <div class="flex-1 text-xs">Actively analyzing</div>
          <div class="p-1 rounded-md bg-ink-200">
            <z-icon icon="plus" iconColor="ink-400" size="x-small"></z-icon>
          </div>
        </div>
        <!-- Placeholders - Subtree - Repo list -->
        <div
          v-if="selectedRepo"
          class="flex items-center h-6 px-2 space-x-2 text-sm rounded-md text-vanilla-300"
        >
          <z-icon icon="refresh-ccw" size="x-small" color="juniper"></z-icon>
          <span>{{ selectedRepo }}</span>
        </div>
        <div v-else class="h-6 rounded-md bg-ink-200"></div>
        <div class="h-6 rounded-md bg-ink-200"></div>
        <div class="h-6 rounded-md bg-ink-200"></div>
        <div class="h-6 rounded-md bg-ink-200"></div>
      </div>
    </section>
    <section class="flex flex-col w-3/5 h-full p-4 space-y-6">
      <!-- Repo heading -->
      <div class="text-vanilla-400">
        {{ handleName }} /
        <span v-if="selectedRepo" class="text-vanilla-100">{{ selectedRepo }}</span
        ><span v-else class="px-16 ml-2 bg-ink-100"></span>
      </div>
      <!-- placeholder -->
      <div class="w-full h-5 rounded-md bg-ink-200"></div>
      <!-- Tab Component -->
      <div class="flex text-sm text-center border-b gap-x-5 border-ink-200">
        <div
          v-for="tab in tabs"
          :key="tab.name"
          class="pb-1 border-b-2 -mb-0.5"
          :class="
            tab.active ? 'text-vanilla-200 border-juniper' : 'text-vanilla-400 border-transparent'
          "
        >
          {{ tab.name }}
        </div>
      </div>
      <!-- placeholder -->
      <div v-if="selectedAnalyzers.length" class="flex">
        <div
          v-for="(analyzer, index) in selectedAnalyzers"
          :key="analyzer.name"
          class="flex flex-row-reverse flex-wrap space-y-2 bg-ink-400"
        >
          <!-- Recently added analyzer in expanded state -->
          <div
            v-if="index == selectedAnalyzers.length - 1"
            class="inline-flex items-center px-2 py-1 space-x-1 border-2 border-solid bg-ink-200 border-ink-400"
          >
            <analyzer-logo v-bind="analyzer" :hideTooltip="true" />
            <span class="text-sm font-bold text-vanilla-200">{{ analyzer.label }}</span>
          </div>
          <!-- Analyzer in shrink state -->
          <div v-else class="inline-flex items-center px-2 py-1 space-x-1">
            <analyzer-logo v-bind="analyzer" :hideTooltip="true" />
          </div>
        </div>
      </div>
      <div v-else class="p-6 bg-ink-100"></div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZAvatar, ZIcon, ZButton } from '@deepsourcelabs/zeal'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
  components: {
    ZAvatar,
    ZIcon,
    ZButton
  },
  methods: { getDefaultAvatar }
})
export default class AnalyzerPreview extends Vue {
  @Prop({ default: {} })
  viewer!: Record<string, string>

  @Prop({ default: [] })
  selectedAnalyzers!: Array<any>

  @Prop({ default: '' })
  selectedRepo!: string

  public handleName: string

  created(): void {
    this.handleName = this.$route.params.login
  }

  tabs: Array<Record<string, unknown>> = [
    {
      name: 'Overview',
      active: false
    },
    {
      name: 'Issues',
      active: true
    },
    {
      name: 'Autofixes',
      active: false
    }
  ]
}
</script>
