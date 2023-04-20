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
      <div class="inline-flex items-center gap-x-2">
        <z-icon
          :icon="isPrivate ? 'z-lock' : 'globe'"
          :size="size === 'small' ? 'x-small' : 'small'"
        />
        <div
          class="font-normal text-vanilla-100"
          :class="{
            'text-base': size === 'small',
            'gap-x-1': size === 'base'
          }"
        >
          <span>{{ ownerLogin }}</span>
          <span>/</span>
          <span>{{ name }}</span>
        </div>
      </div>
      <template v-if="allowStar">
        <transition enter-class="duration-200 opacity-0" leave-class="duration-150 opacity-0">
          <div
            v-if="internalStarredState"
            class="absolute right-1 -top-1.5 transform-gpu transition-all ease-in-out"
          >
            <div class="h-1.5 w-9 bg-ink-200 rounded-t-md opacity-60"></div>
          </div>
        </transition>
        <div class="absolute right-1 -top-1.5 w-8">
          <transition mode="out-in" enter-class="-translate-y-2" leave-class="-translate-y-2">
            <div
              v-if="internalStarredState"
              key="starred"
              class="p-2 pt-3.5 h-10 bg-ink-200 rounded-tr-md shadow-md ribbon transform-gpu transition-all ease-in-out duration-150"
              @click.prevent="toggleStar(false)"
            >
              <z-icon icon="z-star" color="juniper" />
            </div>
            <div
              v-else
              key="not-starred"
              class="p-2 pt-3.5 h-10 transform-gpu transition-all ease-in-out duration-150"
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
          'text-xs font-normal': this.size == 'small',
          'text-sm font-normal': this.size == 'base'
        }"
      >
        <div
          v-if="lastAnalyzedAt"
          v-tooltip="`Last analyzed at`"
          class="inline-flex items-center gap-x-2"
        >
          <z-icon icon="clock" size="x-small" color="vanilla-400" />
          <span>Analyzed {{ lastAnalyzedAtString }}</span>
        </div>
        <!-- Created -->
        <div
          v-if="defaultBranchName"
          v-tooltip="`Default branch name`"
          class="inline-flex items-center gap-x-2"
        >
          <z-icon icon="git-branch" size="x-small" color="vanilla-400" />
          <span class="text-vanilla-400">{{ defaultBranchName }}</span>
        </div>
        <!-- Analyzer Type -->
        <div
          v-if="latestCommitOid"
          v-tooltip="`Latest commit hash`"
          class="inline-flex items-center gap-x-2"
        >
          <z-icon icon="git-commit" size="x-small" />
          <span>{{ latestCommitOid.slice(0, 7) }}</span>
        </div>
        <!-- Supported Analyzers -->
        <div
          v-if="showAnalyzers && Array.isArray(supportedAnalyzers) && supportedAnalyzers.length"
          v-tooltip="`Supported analyzers`"
          class="inline-flex items-center"
        >
          <span
            v-for="analyzer in supportedAnalyzersLogos"
            :key="analyzer.shortcode"
            class="p-px border-2 rounded-full bg-ink-200 border-slate-400 group-hover:border-slate-400"
          >
            <analyzer-logo v-bind="analyzer" :hide-tooltip="true" size="small" />
          </span>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'
import { BaseCard } from '@/components/History'
import { fromNow } from '~/utils/date'
import AnalyzerListMixin from '~/mixins/analyzerListMixin'
import { Analyzer } from '~/types/types'

/**
 * Repo card component
 */
@Component({
  components: {
    BaseCard,
    ZIcon
  }
})
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
  vcsProvider: string

  @Prop({ required: true })
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

  get lastAnalyzedAtString(): string {
    return fromNow(this.lastAnalyzedAt)
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
}
</script>
<style>
.ribbon:after {
  @apply border-slate-400 content top-10 h-0 left-0 absolute w-0;
  border-left-width: 16px;
  border-right-width: 16px;
  border-bottom: 10px solid transparent;
}
</style>
