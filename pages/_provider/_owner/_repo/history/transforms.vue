<template>
  <div class="pb-28 lg:pb-0">
    <sub-nav active="transforms" class="hidden lg:block" />
    <div class="grid w-full grid-cols-1 gap-y-4 p-4">
      <template v-if="transformRuns">
        <template v-if="transformRuns.length">
          <transform-branches v-for="run in transformRuns" :key="run.branchName" :run="run" />
        </template>
        <template v-else>
          <empty-state
            :webp-image-path="require('~/assets/images/ui-states/runs/no-recent-transforms.webp')"
            :subtitle="
              allowConfigGeneration
                ? 'This repository has no transform runs, you can activate Transformers using the config generator.'
                : 'This repository has no transform runs, the repository owner can activate Transformers using the config generator.'
            "
            :show-border="true"
            :use-v2="true"
            content-width="max-w-sm"
            title="No transforms"
          >
            <template #action>
              <div class="flex items-center gap-x-3">
                <nuxt-link v-if="allowConfigGeneration" :to="$generateRoute(['generate-config'])">
                  <z-button size="small" icon="plus"> Add Transformers </z-button>
                </nuxt-link>
                <z-button
                  button-type="secondary"
                  to="https://docs.deepsource.com/docs/transformers"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  icon="doc"
                >
                  Read documentation
                </z-button>
              </div>
            </template>
          </empty-state>
        </template>
      </template>
      <template v-else>
        <div v-for="key in 6" :key="key" class="animate-pulse space-y-2">
          <div class="h-8 w-24 rounded-md bg-ink-200"></div>
          <div class="h-24 w-full rounded-md bg-ink-200"></div>
        </div>
      </template>
    </div>

    <floating-button-mobile
      :nav-items="[
        {
          label: 'Analysis runs',
          routePath: $generateRoute(['history', 'runs'])
        },
        {
          label: 'Transforms',
          routePath: $generateRoute(['history', 'transforms'])
        }
      ]"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'

// Components
import { SubNav, TransformBranches } from '@/components/History'
// Store & Types
import { TransformListActions } from '@/store/transformerRun/list'
import { TransformerRun, TransformerRunConnection } from '~/types/types'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { resolveNodes } from '~/utils/array'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { AppFeatures, RepoPerms } from '~/types/permTypes'

const transformRunListStore = namespace('transformerRun/list')

@Component({
  components: {
    TransformBranches,
    SubNav
  },
  middleware: ['validateProvider', 'featureGate'],
  meta: {
    gateFeature: AppFeatures.TRANSFORMS
  },
  layout: 'repository',
  scrollToTop: true
})
export default class Transforms extends mixins(RepoDetailMixin, RoleAccessMixin) {
  @transformRunListStore.State
  transformerRunList: TransformerRunConnection

  async fetch(): Promise<void> {
    await Promise.all([this.fetchTransformRuns(), this.fetchRepoPerms(this.baseRouteParams)])
  }

  get transformRuns(): TransformerRun[] {
    return resolveNodes(this.transformerRunList)
  }

  mounted(): void {
    this.$socket.$on('transformerrun-patches-ready', this.fetchTransformRuns)
    this.$socket.$on('repo-transform-created', this.fetchTransformRuns)
  }

  beforeDestroy(): void {
    this.$socket.$off('transformerrun-patches-ready', this.fetchTransformRuns)
    this.$socket.$off('transformerrun-patches-ready', this.fetchTransformRuns)
  }

  get allowConfigGeneration(): boolean {
    return this.$gateKeeper.repo(RepoPerms.ACTIVATE_REPOSITORY, this.repoPerms.permission)
  }

  async fetchTransformRuns(): Promise<void> {
    await this.$store.dispatch(
      `transformerRun/list/${TransformListActions.FETCH_TRANSFORMER_RUN_LIST}`,
      {
        provider: this.$route.params.provider,
        owner: this.$route.params.owner,
        name: this.$route.params.repo,
        currentPageNumber: 0,
        limit: 30
      }
    )
  }

  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `History • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
