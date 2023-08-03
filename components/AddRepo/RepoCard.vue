<template>
  <base-card
    :show-info="false"
    :to="repoRoute"
    :remove-default-style="removeDefaultStyle"
    class="group"
    @click="$emit('click')"
    @click.native="$emit('click')"
  >
    <template #title>
      <div class="inline-flex items-baseline gap-x-2">
        <z-icon :icon="icon" :size="size === 'small' ? 'x-small' : 'small'" class="flex-shrink-0" />

        <div
          class="font-normal text-vanilla-100"
          :class="{
            'text-base': size === 'small'
          }"
        >
          {{ title }}
        </div>

        <!-- Currently the inactive status is only shown for subrepos -->
        <!-- Not using `ZTag` since it doesn't support custom font color -->
        <div
          v-if="showInactiveTag"
          class="text-8px inline-flex items-center justify-evenly space-x-2 rounded-full bg-honey-500 px-2 py-0.5 text-ink-400 md:self-center"
        >
          INACTIVE
        </div>
      </div>
      <template v-if="allowStar">
        <transition enter-class="duration-200 opacity-0" leave-class="duration-150 opacity-0">
          <div
            v-if="internalStarredState"
            class="absolute -top-1.5 right-1 transform-gpu transition-all ease-in-out"
          >
            <div class="h-1.5 w-9 rounded-t-md bg-ink-200 opacity-60"></div>
          </div>
        </transition>
        <div class="absolute -top-1.5 right-1 w-8">
          <transition mode="out-in" enter-class="-translate-y-2" leave-class="-translate-y-2">
            <div
              v-if="internalStarredState"
              key="starred"
              class="ribbon h-10 transform-gpu rounded-tr-md bg-ink-200 p-2 pt-3.5 shadow-md transition-all duration-150 ease-in-out"
              @click.prevent="toggleStar(false)"
            >
              <z-icon icon="z-star" color="juniper" />
            </div>
            <div
              v-else
              key="not-starred"
              class="h-10 transform-gpu p-2 pt-3.5 transition-all duration-150 ease-in-out"
              @click.prevent="toggleStar(true)"
            >
              <z-icon icon="z-star" color="ink-200 text-ink-200" />
            </div>
          </transition>
        </div>
      </template>
    </template>
    <template #description>
      <div
        class="flex flex-wrap items-center gap-x-4 gap-y-2 text-vanilla-400"
        :class="{
          'text-xs font-normal': size == 'small',
          'text-sm font-normal': size == 'base'
        }"
      >
        <template v-for="config in repoDescConfig">
          <div
            v-if="config.condition"
            :key="config.icon"
            v-tooltip="config.tooltipText || ''"
            class="inline-flex items-center gap-x-2"
          >
            <z-icon :icon="config.icon" size="x-small" />
            <span>{{ config.text }}</span>
          </div>
        </template>

        <!-- Supported Analyzers -->
        <div
          v-if="showAnalyzers && Array.isArray(supportedAnalyzers) && supportedAnalyzers.length"
          v-tooltip="`Supported analyzers`"
          class="inline-flex items-center"
        >
          <span
            v-for="analyzer in supportedAnalyzersLogos"
            :key="analyzer.shortcode"
            class="rounded-full border-2 border-slate-400 bg-ink-200 p-px group-hover:border-slate-400"
          >
            <analyzer-logo v-bind="analyzer" :hide-tooltip="true" size="small" />
          </span>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Component, mixins, Prop, Watch } from 'nuxt-property-decorator'

import AnalyzerListMixin from '~/mixins/analyzerListMixin'
import { Analyzer, RepositoryKindChoices } from '~/types/types'
import { fromNow } from '~/utils/date'

type RepoDescConfigT = {
  condition?: boolean
  icon: string
  text: string
  tooltipText?: string
}

/**
 * Repo card component
 */
@Component({})
export default class RepoCard extends mixins(AnalyzerListMixin) {
  @Prop({ default: false })
  removeDefaultStyle: boolean

  @Prop({ default: 'base' })
  size: string

  @Prop({ default: false })
  allowStar: boolean

  @Prop({ default: false })
  isStarred: boolean

  @Prop()
  id: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  displayName: string

  @Prop({ required: true })
  vcsProvider: string

  @Prop()
  ownerLogin: string

  @Prop()
  isPrivate: boolean

  @Prop()
  latestCommitOid: string

  @Prop()
  defaultBranchName: string

  @Prop()
  lastAnalyzedAt: string

  @Prop()
  supportedAnalyzers!: Array<string>

  @Prop({ default: '' })
  route: string

  @Prop({ default: true })
  isLink: boolean

  @Prop({ default: '' })
  analyzerShortcode: string

  @Prop({ default: '' })
  transformerShortcode: string

  @Prop({ default: false })
  showAnalyzers: boolean

  @Prop({ required: true })
  kind: RepositoryKindChoices

  @Prop({ default: false })
  showInactiveTag: boolean

  @Prop({ default: false })
  isExactRoute: boolean

  @Prop({ default: 0 })
  subrepoCount: number

  @Prop({ default: '' })
  createdAt: string

  /**
   * Watcher to toggle the internal starred state based on
   * the data in the store as it's updated
   *
   * @return {void}
   */
  @Watch('isStarred', { immediate: true })
  updateStarred(): void {
    this.internalStarredState = this.isStarred
  }

  /**
   * toggle isStarred state and trigger event
   *
   * @param {boolean} isStarred
   *
   * @return {void}
   */
  toggleStar(isStarred: boolean): void {
    if (isStarred) {
      this.$emit('star-repo', this.id)
    } else {
      this.$emit('un-star-repo', this.id)
    }
    this.internalStarredState = isStarred
  }

  /**
   * Fetch analyzer list in case showAnalyzer is selected
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    if (this.showAnalyzers) {
      await this.fetchAnalyzers()
    }
  }

  internalStarredState = false

  get lastAnalyzedAtFromNow(): string {
    return fromNow(this.lastAnalyzedAt)
  }

  get createdAtFromNow(): string {
    return fromNow(this.createdAt)
  }

  get repoDescConfig(): RepoDescConfigT[] {
    if (this.kind === RepositoryKindChoices.Monorepo) {
      return [
        {
          condition: Boolean(this.createdAt),
          icon: 'clock',
          text: `Created ${this.createdAtFromNow}`
        },
        {
          condition: Boolean(this.defaultBranchName),
          icon: 'z-git-branch',
          text: this.defaultBranchName,
          tooltipText: 'Default branch name'
        },
        {
          condition: Number.isFinite(this.subrepoCount),
          icon: 'folder-closed',
          text: `${this.subrepoCount} ${
            this.subrepoCount === 1 ? 'sub-repository' : 'sub-repositories'
          }`
        }
      ]
    }

    return [
      // Display `createdAt` information if `lastAnalyzedAt` information is not available
      {
        condition: Boolean(this.lastAnalyzedAt) || Boolean(this.createdAt),
        icon: 'clock',
        text: this.lastAnalyzedAt
          ? `Analyzed ${this.lastAnalyzedAtFromNow}`
          : `Created ${this.createdAtFromNow}`,
        tooltipText: this.lastAnalyzedAt ? 'Last Analyzed at' : ''
      },
      {
        condition: Boolean(this.defaultBranchName),
        icon: 'z-git-branch',
        text: this.defaultBranchName,
        tooltipText: 'Default branch name'
      },
      {
        condition: Boolean(this.latestCommitOid),
        icon: 'git-commit',
        text: this.latestCommitOid?.slice(0, 7),
        tooltipText: 'Last commit hash'
      }
    ]
  }

  get supportedAnalyzersLogos(): Analyzer[] {
    return this.analyzerList.filter((analyzer) =>
      this.supportedAnalyzers.includes(analyzer.shortcode)
    )
  }

  get repoRoute(): string {
    if (!this.isLink) {
      return ''
    }

    if (this.isExactRoute) {
      return this.route
    }

    const { provider, owner } = this.$route.params
    const route = ['']

    if (this.vcsProvider) {
      route.push(this.$providerMetaMap[this.vcsProvider].shortcode)
    } else if (provider) {
      route.push(provider)
    }

    if (this.ownerLogin) {
      route.push(this.ownerLogin)
    } else if (owner) {
      route.push(owner)
    }

    route.push(this.name)

    if (this.route) {
      route.push(this.route)
    }

    const routeToRepo = route.join('/')
    let queryParams = ''

    if (this.analyzerShortcode) {
      queryParams = `?preset-analyzer=${this.analyzerShortcode}`
      if (this.transformerShortcode)
        queryParams = queryParams.concat(`&preset-transformer=${this.transformerShortcode}`)
    }

    return routeToRepo.concat(queryParams)
  }

  get icon() {
    if (this.isSubRepository) {
      return this.isPrivate ? 'folder-locked' : 'folder-globe'
    }

    if (this.kind === RepositoryKindChoices.Repo) {
      return this.isPrivate ? 'z-lock' : 'globe'
    }

    return 'monorepo'
  }

  get isSubRepository(): boolean {
    return this.kind === RepositoryKindChoices.Subrepo
  }

  get title(): string {
    return `${this.ownerLogin} / ${this.displayName}`
  }
}
</script>
<style lang="postcss">
.ribbon:after {
  @apply absolute left-0 top-10 h-0 w-0 border-slate-400 content;
  border-left-width: 16px;
  border-right-width: 16px;
  border-bottom: 10px solid transparent;
}

.text-8px {
  font-size: 8px;
}
</style>
