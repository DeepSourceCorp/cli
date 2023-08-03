<template>
  <div class="flex h-80 w-11/12 rounded-md bg-ink-300">
    <section class="w-2/5 space-y-4 border-r border-slate-400 p-4">
      <!-- Avatar and header -->
      <div class="flex items-center space-x-2">
        <!-- Avatar Component -->
        <z-avatar
          v-if="viewer.avatar && viewer.firstName"
          :image="viewer.avatar"
          :fallback-image="getDefaultAvatar(viewer.email)"
          :user-name="viewer.firstName"
          size="sm"
        />
        <z-avatar v-else :loading="true" user-name="loading" size="md" />
        <!-- Handle Name -->
        <div
          class="flex cursor-pointer items-center space-x-2 text-base font-medium text-vanilla-200"
        >
          {{ viewer.firstName || viewer.email }}
          <z-icon icon="chevron-down" size="small" color="vanilla-200" />
        </div>
      </div>
      <!-- Blank space -->
      <div class="w-full rounded-md bg-ink-200 p-10"></div>
      <!-- Start analysing menu -->
      <div class="space-y-2">
        <div class="flex items-center space-x-1">
          <z-icon icon="activity" size="x-small" class="mr-1 flex-shrink-0" />
          <div class="flex-1 text-xs">Actively analyzing</div>
          <div class="rounded-md bg-ink-200 p-1">
            <z-icon icon="plus" icon-color="ink-400" size="x-small" />
          </div>
        </div>
        <!-- Placeholders - Subtree - Repo list -->
        <div
          v-if="selectedRepo"
          class="flex h-6 items-center space-x-2 rounded-md px-2 text-sm text-vanilla-300"
        >
          <z-icon icon="refresh-ccw" size="x-small" color="juniper" />
          <span>{{ selectedRepo }}</span>
        </div>
        <div v-else class="h-6 rounded-md bg-ink-200"></div>
        <div class="h-6 rounded-md bg-ink-200"></div>
        <div class="h-6 rounded-md bg-ink-200"></div>
        <div class="h-6 rounded-md bg-ink-200"></div>
      </div>
    </section>
    <section class="flex h-full w-3/5 flex-col space-y-6 p-4">
      <!-- Repo heading -->
      <div class="text-vanilla-400">
        {{ handleName }} /
        <span v-if="selectedRepo" class="text-vanilla-100">{{ selectedRepo }}</span
        ><span v-else class="ml-2 bg-ink-100 px-16"></span>
      </div>
      <!-- placeholder -->
      <div class="h-5 w-full rounded-md bg-ink-200"></div>
      <!-- Tab Component -->
      <div class="flex gap-x-5 border-b border-slate-400 text-center text-sm">
        <div
          v-for="tab in tabs"
          :key="tab.name"
          class="-mb-0.5 border-b-2 pb-1"
          :class="
            tab.active ? 'border-juniper text-vanilla-200' : 'border-transparent text-vanilla-400'
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
            class="inline-flex items-center space-x-1 border-2 border-solid border-slate-400 bg-ink-200 px-2 py-1"
          >
            <analyzer-logo v-bind="analyzer" :hide-tooltip="true" />
            <span class="text-sm font-bold text-vanilla-200">{{ analyzer.label }}</span>
          </div>
          <!-- Analyzer in shrink state -->
          <div v-else class="inline-flex items-center space-x-1 px-2 py-1">
            <analyzer-logo v-bind="analyzer" :hide-tooltip="true" />
          </div>
        </div>
      </div>
      <div v-else class="bg-ink-100 p-6"></div>
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
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
