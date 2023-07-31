<template>
  <ul class="space-y-4">
    <template v-if="repoListLoading">
      <li v-for="idx in perPageCount" :key="idx" class="rounded h-17 animate-pulse bg-ink-300"></li>
    </template>

    <template v-else-if="repoList.length">
      <repo-card
        v-for="repo in repoList"
        v-bind="repoCardBindings(repo)"
        :key="repo.id"
        size="small"
      />
    </template>

    <lazy-empty-state v-else v-bind="emptyStateBindings" />
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { OwnerFeatureType } from '~/types/ownerTypes'

import { AppFeatures } from '~/types/permTypes'
import { RepoStatusType } from '~/types/repository'
import { Repository } from '~/types/types'

@Component({
  middleware: [
    'validateProvider',
    async function ({ route, error, $gateKeeper, $isFeatureAvailable, $providerMetaMap }) {
      const { repoType, provider, owner } = route.params

      const validRepoType = Object.values<string>(RepoStatusType).includes(repoType)

      //? If repoType is not Monorepo, allow, else check if the provider is allowed to have monorepos.
      const doesVcsHaveFeature =
        repoType !== RepoStatusType.MONOREPO
          ? true
          : $gateKeeper.provider(AppFeatures.MONOREPO, provider)

      //? If repoType is Monorepo, check if the owner is allowed to have monorepos, else allow.
      let doesOwnerHaveFeature = false

      if (repoType === RepoStatusType.MONOREPO) {
        doesOwnerHaveFeature = await $isFeatureAvailable(OwnerFeatureType.MONOREPO, {
          login: owner,
          provider: $providerMetaMap[provider].value
        })
      } else {
        doesOwnerHaveFeature = true
      }

      if (validRepoType && doesVcsHaveFeature && doesOwnerHaveFeature) {
        return
      }
      error({ statusCode: 404 })
    }
  ],
  layout: 'dashboard'
})
export default class RepoType extends Vue {
  @Prop({ default: false })
  repoListLoading: boolean

  @Prop({ default: () => [] })
  repoList: Array<Repository>

  @Prop({ default: 30 })
  perPageCount: number

  @Prop({ default: '' })
  searchCandidate: string

  get activeProviderName(): string {
    return this.$providerMetaMap[this.$route.params.provider].text
  }

  repoCardBindings(repo: Repository) {
    const {
      id,
      isPrivate,
      kind,
      name,
      displayName,
      ownerLogin,
      vcsProvider,
      defaultBranchName,
      lastAnalyzedAt,
      latestCommitOid,
      subRepos,
      createdAt
    } = repo

    const commonBindings = {
      id,
      isPrivate,
      kind,
      name,
      displayName,
      ownerLogin,
      vcsProvider,
      defaultBranchName
    }

    const bindings: Record<string, Partial<Repository & { subrepoCount: number }>> = {
      [RepoStatusType.ACTIVATED]: {
        ...commonBindings,
        lastAnalyzedAt,
        latestCommitOid
      },
      [RepoStatusType.INACTIVE]: {
        ...commonBindings,
        createdAt,
        latestCommitOid
      },
      [RepoStatusType.MONOREPO]: {
        ...commonBindings,
        subrepoCount: subRepos?.totalCount ?? 0,
        createdAt
      }
    }

    const { repoType } = this.$route.params

    return bindings[repoType]
  }

  get emptyStateBindings() {
    if (this.searchCandidate) {
      return {
        title: `No results found for '${this.searchCandidate}'`,
        'webp-image-path': require('~/assets/images/ui-states/directory/empty-search.webp'),
        'png-image-path': require('~/assets/images/ui-states/directory/empty-search.gif'),
        subtitle: 'Please try changing your search query.',
        'show-border': true
      }
    }

    if (this.$route.params.repoType === RepoStatusType.MONOREPO) {
      return {
        title: "You don't have a monorepo yet",
        subtitle:
          'You need to define a repository as a monorepo either from the repository settings or while activating a repository.',
        'webp-image-path': require('~/assets/images/ui-states/runs/no-recent-autofixes.webp'),
        'show-border': true
      }
    }

    return {
      title: 'No repositories',
      subtitle: `DeepSource doesn't have access to any repositories from your account. Please check your settings on ${this.activeProviderName}.`,
      'show-border': true
    }
  }
}
</script>
