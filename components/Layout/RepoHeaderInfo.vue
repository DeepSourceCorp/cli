<template>
  <div>
    <div v-if="commitId" class="flex items-center space-x-2">
      <z-icon size="small" icon="clock"></z-icon>
      <div class="space-x-1 overflow-hidden sm:flex sm:items-center overflow-ellipsis">
        <span class="whitespace-nowrap">Last analyzed</span>
        <nuxt-link
          :to="$generateRoute(['run', runId, analyzer])"
          class="inline-flex items-center gap-1 px-1 font-mono rounded-md cursor-pointer bg-ink-200"
        >
          <z-icon icon="git-commit" size="x-small"></z-icon>
          {{ commitId.slice(0, 7) }}
        </nuxt-link>
        <span class="whitespace-nowrap" v-if="lastAnalyzed">{{ fromNow(lastAnalyzed) }}</span>
      </div>
    </div>
    <div v-if="defaultBranch" class="flex items-center space-x-2">
      <z-icon size="small" icon="git-branch" class="flex-shrink-0"></z-icon>
      <div>
        <span>Default analysis branch is</span>
        <z-menu direction="left" size="base" class="inline text-vanilla-100">
          <template v-slot:trigger="{ toggle }">
            <button type="button" class="outline-none focus:outline-none" @click="toggle">
              <span class="flex items-center gap-1 px-1 rounded-md bg-ink-200 text-vanilla-400">
                <span class="font-mono truncate" :class="defaultBranch.length > 12 ? 'w-24' : ''">
                  {{ defaultBranch }}
                </span>
                <z-icon icon="chevron-down" size="small"></z-icon>
              </span>
            </button>
          </template>
          <template slot="body">
            <a :href="vcsUrl" target="blank" rel="noreferrer noopener">
              <z-menu-item>
                <span class="leading-snug">
                  View <span class="inline font-mono">{{ defaultBranch }}</span> on
                  {{ $providerMetaMap[repository.vcsProvider].text }}
                </span>
              </z-menu-item>
            </a>
            <z-menu-item v-if="canChangeBranch" @click="showBranchUpdateModal = true">
              Change default analysis branch
            </z-menu-item>
          </template>
        </z-menu>
      </div>
    </div>
    <div v-if="currentlyAnalysing > 0" class="flex items-center gap-2">
      <z-pulse></z-pulse>
      <span
        >Currently analyzing {{ currentlyAnalysing }}
        {{ currentlyAnalysing > 1 ? 'runs' : 'run' }}</span
      >
    </div>
    <portal to="modal">
      <z-modal
        v-if="showBranchUpdateModal"
        @onClose="showBranchUpdateModal = false"
        width="narrow"
        title="Update Default Analysis Branch"
      >
        <template v-slot:default="{ close }">
          <div class="p-4">
            <label class="text-sm text-vanilla-400">Update default analysis branch</label>
            <z-input
              size="small"
              class="mt-1"
              placeholder="New Branch name"
              v-model="currentAnalysisBranch"
            ></z-input>
            <div class="mt-4 space-x-4 text-right text-vanilla-100">
              <z-button
                v-if="updating"
                class="flex items-center w-54"
                buttonType="primary"
                size="small"
                :disabled="true"
              >
                <z-icon icon="spin-loader" color="ink" class="mr-2 animate-spin"></z-icon>
                Updating Branch
              </z-button>
              <z-button
                v-else
                icon="check-circle"
                class="w-54 modal-primary-action"
                buttonType="primary"
                size="small"
                @click="updateDefaultBranch(close)"
                >Update Branch</z-button
              >
            </div>
          </div>
        </template>
      </z-modal>
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZPulse, ZModal, ZInput, ZMenu, ZMenuItem, ZButton } from '@deepsourcelabs/zeal'
import { fromNow } from '@/utils/date'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

@Component({
  components: {
    ZIcon,
    ZPulse,
    ZModal,
    ZInput,
    ZMenu,
    ZMenuItem,
    ZButton
  },
  methods: { fromNow }
})
export default class RepoHeaderInfo extends mixins(RepoDetailMixin) {
  @Prop({ default: '' })
  commitId: string

  @Prop({ default: null })
  defaultBranch: string

  @Prop({ default: '' })
  lastAnalyzed: string

  @Prop({ default: '' })
  vcsUrl: string

  @Prop({ default: '' })
  runId: string

  @Prop({ default: '' })
  analyzer: string

  @Prop({ default: false })
  canChangeBranch: boolean

  @Prop()
  currentlyAnalysing!: number

  public showBranchUpdateModal = false
  public currentAnalysisBranch = ''

  public updating = false

  mounted(): void {
    this.updateLocalData()
  }

  @Watch('defaultBranch')
  updateLocalData() {
    this.currentAnalysisBranch = this.defaultBranch
  }

  async updateDefaultBranch(close: () => void): Promise<void> {
    this.updating = true
    await this.updateRepoSettings({
      input: {
        id: this.repository.id,
        defaultBranchName: this.currentAnalysisBranch
      }
    })
    await this.fetchBasicRepoDetails({
      ...this.baseRouteParams,
      refetch: true
    })
    this.updating = false
    if (close) {
      close()
    } else {
      this.showBranchUpdateModal = false
    }
  }
}
</script>
