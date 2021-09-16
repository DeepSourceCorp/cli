<template>
  <base-card
    :showInfo="false"
    :to="repoRoute"
    :removeDefaultStyle="removeDefaultStyle"
    class="relative"
  >
    <template slot="title">
      <div class="space-x-2 inline-flex items-center">
        <z-icon :icon="isPrivate ? 'lock' : 'globe'" size="small"></z-icon>
        <div
          class="text-vanilla-400"
          :class="{
            'text-base font-normal': size === 'small',
            'space-x-1': size === 'base'
          }"
        >
          <span>{{ ownerLogin }}</span>
          <span>/</span>
          <span class="text-vanilla-100">{{ name }}</span>
        </div>
      </div>
      <template v-if="allowStar">
        <transition enter-class="opacity-0 duration-200" leave-class="opacity-0 duration-150">
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
              @click.prevent="toggleStar(false)"
              key="starred"
              class="p-2 pt-3.5 h-10 bg-ink-200 rounded-tr-md shadow-md ribbon transform-gpu transition-all ease-in-out duration-150"
            >
              <z-icon icon="z-star" color="juniper" />
            </div>
            <div
              v-else
              @click.prevent="toggleStar(true)"
              key="not-starred"
              class="p-2 pt-3.5 h-10 transform-gpu transition-all ease-in-out duration-150"
            >
              <z-icon icon="z-star" color="ink-200 text-ink-200" />
            </div>
          </transition>
        </div>
      </template>
    </template>
    <template slot="description">
      <div
        class="flex items-center space-x-4 text-vanilla-400"
        :class="{
          'text-xs font-normal': this.size == 'small',
          'text-sm font-normal': this.size == 'base'
        }"
      >
        <div v-if="lastAnalyzedAt" class="inline-flex items-center space-x-2">
          <z-icon icon="clock" size="small" color="vanilla-400"></z-icon>
          <span>Analyzed {{ lastAnalyzedAtString }}</span>
        </div>
        <!-- Created -->
        <div v-if="defaultBranchName" class="inline-flex items-center space-x-2">
          <z-icon icon="git-branch" size="x-small" color="vanilla-400"></z-icon>
          <span class="text-vanilla-400">{{ defaultBranchName }}</span>
        </div>
        <!-- Analyzer Type -->
        <div v-if="latestCommitOid" class="inline-flex items-center space-x-2">
          <z-icon icon="git-commit" size="x-small"></z-icon>
          <span>{{ latestCommitOid.slice(0, 7) }}</span>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { BaseCard } from '@/components/History'
import { fromNow } from '~/utils/date'

@Component({
  components: {
    BaseCard,
    ZIcon
  }
})
export default class RepoCard extends Vue {
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
  modifiedAt: string

  @Prop()
  isActivated: boolean

  @Prop()
  isFork: boolean

  @Prop()
  isPrivate: boolean

  @Prop()
  latestCommitOid: string

  @Prop()
  defaultBranchName: string

  @Prop()
  lastAnalyzedAt: string

  @Prop()
  config!: Record<string, string>

  @Prop()
  canBeActivated!: boolean

  @Prop()
  supportedAnalyzers!: Array<string>

  @Prop({ default: '' })
  route: string

  @Watch('isStarred', { immediate: true })
  updateStarred(): void {
    this.internalStarredState = this.isStarred
  }

  toggleStar(isStarred: boolean) {
    if (isStarred) {
      this.$emit('star-repo', this.id)
    } else {
      this.$emit('un-star-repo', this.id)
    }
    this.internalStarredState = isStarred
  }

  internalStarredState = false

  get lastAnalyzedAtString(): string {
    return fromNow(this.lastAnalyzedAt)
  }
  get repoRoute(): string {
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

    return route.join('/')
  }
}
</script>
<style>
.ribbon:after {
  @apply border-ink-200 content top-10 h-0 left-0 absolute w-0;
  border-left-width: 16px;
  border-right-width: 16px;
  border-bottom: 10px solid transparent;
}
</style>
