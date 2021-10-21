<template>
  <div>
    <transform-header
      v-bind="transformerRun"
      :routeToPrevious="routeToPrevious"
      :currentAnalyzer="$route.params.analyzer"
    ></transform-header>
    <div class="flex flex-col space-y-3 w-full">
      <!-- Transform section banner -->
      <div class="flex w-full bg-ink-300 px-4 py-2 text-vanilla-400 items-center space-x-2">
        <z-icon icon="zap" color="vanilla-400" size="small"></z-icon>
        <span class="uppercase tracking-normal sm:tracking-wide text-xxs sm:text-sm">
          transform session
        </span>
        <div class="w-px bg-ink-200 h-full"></div>
        <div class="flex-1 space-x-2">
          <z-tag
            v-for="tool in transformerRun.tools"
            :key="tool.shortcode"
            class="text-vanilla-300 flex items-center space-x-1"
            textSize="xs"
            spacing="py-1 px-2"
            bgColor="ink-200"
          >
            <img
              class="h-3.5 inline-block overflow-hidden"
              :src="tool.logo_path"
              :alt="tool.name"
            />
            <span>{{ tool.name }}</span>
          </z-tag>
        </div>
        <a v-if="transformerRun.vcsCommitUrl" :href="transformerRun.vcsCommitUrl" target="_blank">
          <z-button
            buttonType="secondary"
            size="small"
            class="flex space-x-2"
            spacing="px-1.5 sm:px-3"
          >
            <span>View commit</span>
            <z-icon icon="arrow-up-right" size="small"></z-icon>
          </z-button>
        </a>
        <a v-else-if="transformerRun.vcsPrUrl" :href="transformerRun.vcsPrUrl" target="_blank">
          <z-button
            buttonType="secondary"
            size="small"
            class="flex space-x-2"
            spacing="px-1.5 sm:px-3"
          >
            <span>View PR</span>
            <z-icon icon="arrow-up-right" size="small"></z-icon>
          </z-button>
        </a>
      </div>
      <div
        class="px-4"
        v-if="!$fetchState.pending && parseArrayString(transformerRun.errors).length"
      >
        <run-error-box :errorsRendered="parseArrayString(transformerRun.errors)" />
      </div>
      <!-- Code Diff -->
      <div class="p-4 space-y-4">
        <div
          v-for="(changes, name) in transformerRun.changeset"
          :key="name"
          class="w-full border border-ink-200 rounded-md"
        >
          <!-- Heading -->
          <div class="px-4 py-2 bg-ink-300 text-vanilla-100 font-medium">
            {{ name }}
          </div>
          <!-- Code -->
          <div
            v-for="(change, index) in changes"
            :key="change.id"
            class="flex w-full"
            :class="{ 'border-b-4 border-ink-200': index !== changes.length - 1 }"
          >
            <div class="after_html w-1/2 border-r border-ink-200">
              <z-code :content="change.before_html"></z-code>
            </div>
            <div class="before_html w-1/2">
              <z-code :content="change.after_html"></z-code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, namespace, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZTag, ZDivider, ZCode } from '@deepsourcelabs/zeal'
import { TransformHeader } from '@/components/Transform'

// Import State & Types
import { TransformerRunActions } from '@/store/transformerRun/detail'
import { TransformerRun } from '~/types/types'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { parseArrayString } from '~/utils/array'

const transformDetailStore = namespace('transformerRun/detail')

@Component({
  components: {
    ZIcon,
    ZButton,
    ZTag,
    ZDivider,
    ZCode,
    TransformHeader
  },
  layout: 'repository'
})
export default class Issues extends mixins(RepoDetailMixin) {
  @transformDetailStore.State
  transformerRun: TransformerRun

  TRANSFORM_STATUS = {
    PASS: 'PASS',
    TIMO: 'TIMO',
    FAIL: 'FAIL',
    STAL: 'STAL'
  }

  COMMIT_STATUS = {
    COMMITTED: 'CTB',
    NOT_COMMITTED: 'NCB',
    FAILED: 'CTF'
  }

  PULL_REQUEST_STATUS = {
    NOT_CREATED: 'PNC',
    OPENED: 'PRO',
    CREATED: 'PRC',
    MERGED: 'PRM',
    FAILED: 'PRF'
  }

  parseArrayString = parseArrayString

  async fetch(): Promise<void> {
    await this.fetchTransformerRun()
  }

  mounted(): void {
    this.$socket.$on('transformerrun-patches-ready', this.fetchTransformerRun)
    this.$socket.$on('repo-transform-created', this.fetchTransformerRun)
  }

  beforeDestroy(): void {
    this.$socket.$off('transformerrun-patches-ready', this.fetchTransformerRun)
    this.$socket.$off('repo-transform-created', this.fetchTransformerRun)
  }

  async fetchTransformerRun(): Promise<void> {
    return this.$store.dispatch(
      `transformerRun/detail/${TransformerRunActions.FETCH_TRANSFORMER_RUN}`,
      {
        runId: this.$route.params.transformId
      }
    )
  }

  get routeToPrevious(): string {
    return this.$generateRoute(['history', 'transforms'])
  }

  head(): Record<string, string> {
    const { owner, repo } = this.$route.params
    let title = ''
    if (this.transformerRun.branchName) {
      title = `${this.transformerRun.branchName} ${title}`
    }
    if (this.transformerRun.commitOidShort) {
      title = `${title} @ ${this.transformerRun.commitOidShort} `
    }
    return {
      title: `${title || 'Transform'} • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
