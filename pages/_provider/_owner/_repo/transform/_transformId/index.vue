<template>
  <div>
    <sub-nav active="transforms" />

    <template v-if="transformerViewLoading">
      <div class="mx-4 mt-6 h-6 w-32 animate-pulse rounded-md bg-ink-300"></div>
      <div class="mx-4 mt-3 h-19 w-3/4 animate-pulse rounded-md bg-ink-300 sm:w-4/5"></div>
      <div class="mt-6 h-12 w-full animate-pulse rounded-md bg-ink-300"></div>
      <div class="mx-4 mt-7 h-98 w-auto animate-pulse rounded-md bg-ink-300"></div>
    </template>

    <lazy-empty-state-card
      v-else-if="isArchivedTransformerRun"
      :show-border="true"
      :use-v2="true"
      :webp-image-path="require('~/assets/images/ui-states/runs/no-recent-autofixes.webp')"
      subtitle="We archive all older runs periodically to keep your dashboard lean, clean, and fast."
      title="This Transformer run has been archived"
      class="mt-52 max-w-sm md:max-w-xl"
    />

    <template v-else>
      <transform-header
        v-bind="transformerRun"
        :route-to-previous="routeToPrevious"
        :current-analyzer="$route.params.analyzer"
      />
      <div class="flex w-full flex-col space-y-3">
        <!-- Transform section banner -->
        <div class="flex w-full items-center space-x-2 bg-ink-300 px-4 py-2 text-vanilla-400">
          <z-icon icon="zap" color="vanilla-400" size="small" />
          <span class="text-xxs uppercase tracking-normal sm:text-sm sm:tracking-wide">
            transform session
          </span>
          <div class="h-full w-px bg-ink-200"></div>
          <div class="flex-1 space-x-2">
            <z-tag
              v-for="tool in transformerRun.tools"
              :key="tool.shortcode"
              class="flex items-center space-x-1 text-vanilla-300"
              text-size="xs"
              spacing="py-1 px-2"
              bg-color="ink-200"
            >
              <img
                class="inline-block h-3.5 overflow-hidden"
                :src="tool.logo_path"
                :alt="tool.name"
              />
              <span>{{ tool.name }}</span>
            </z-tag>
          </div>
          <a
            v-if="transformerRun.vcsCommitUrl"
            :href="transformerRun.vcsCommitUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <z-button
              button-type="secondary"
              size="small"
              class="flex space-x-2"
              spacing="px-1.5 sm:px-3"
            >
              <span>View commit</span>
              <z-icon icon="arrow-up-right" size="small" />
            </z-button>
          </a>
          <a
            v-else-if="transformerRun.vcsPrUrl"
            :href="transformerRun.vcsPrUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <z-button
              button-type="secondary"
              size="small"
              class="flex space-x-2"
              spacing="px-1.5 sm:px-3"
            >
              <span>View PR</span>
              <z-icon icon="arrow-up-right" size="small" />
            </z-button>
          </a>
        </div>
        <div
          v-if="transformerRun.errorsRendered && transformerRun.errorsRendered.length"
          class="px-4"
        >
          <run-error-box :errors-rendered="transformerRun.errorsRendered" />
        </div>
        <!-- Code Diff -->
        <div class="space-y-4 p-4">
          <div
            v-for="(changes, name) in transformerRun.changeset"
            :key="name"
            class="w-full rounded-md border border-slate-400"
          >
            <!-- Heading -->
            <div class="bg-ink-300 px-4 py-2 font-medium text-vanilla-100">
              {{ name }}
            </div>
            <!-- Code -->
            <div
              v-for="(change, index) in changes"
              :key="change.id"
              class="grid w-full grid-cols-2"
              :class="{ 'border-b-4 border-slate-400': index !== changes.length - 1 }"
            >
              <div class="after_html col-span-1 border-r border-slate-400">
                <z-code :content="change.before_html" />
              </div>
              <div class="before_html col-span-1">
                <z-code :content="change.after_html" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { TransformHeader } from '@/components/Transform'
import { Component, mixins, namespace } from 'nuxt-property-decorator'

// Import State & Types
import { TransformerRunActions } from '@/store/transformerRun/detail'

import RepoDetailMixin from '~/mixins/repoDetailMixin'

import { AppFeatures } from '~/types/permTypes'
import { RunTypes } from '~/types/run'
import { TransformerRun } from '~/types/types'

const transformDetailStore = namespace('transformerRun/detail')

@Component({
  components: {
    TransformHeader
  },
  middleware: ['validateProvider', 'featureGate'],
  meta: {
    gateFeature: AppFeatures.TRANSFORMS
  },
  layout: 'repository'
})
export default class Issues extends mixins(RepoDetailMixin) {
  isArchivedTransformerRun = false
  transformerViewLoading = false

  @transformDetailStore.State
  transformerRun: TransformerRun

  @transformDetailStore.State
  error: Error

  @transformDetailStore.Action(TransformerRunActions.FETCH_TRANSFORMER_RUN)
  fetchTransformRun: (args: { runId: string }) => Promise<TransformerRun | undefined>

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

  async fetch(): Promise<void> {
    const { transformId } = this.$route.params

    if (!transformId) {
      this.$nuxt.error({ statusCode: 404 })
    }

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
    this.transformerViewLoading = true

    const { transformId } = this.$route.params

    const run = await this.fetchTransformRun({
      runId: transformId
    })

    if (this.error.message?.replace('GraphQL error: ', '') === RunTypes.ARCHIVED_RUN && !run) {
      this.isArchivedTransformerRun = true
      this.transformerViewLoading = false

      return
    }

    if (!run || !Object.keys(run).length) {
      this.$nuxt.error({
        statusCode: 404,
        message: `transform run "${transformId}" does not exist!`
      })
    }

    this.transformerViewLoading = false
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
