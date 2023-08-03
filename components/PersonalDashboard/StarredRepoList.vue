<template>
  <list-section v-if="starredRepos.length" title="Starred repositories">
    <ul class="hide-scroll max-h-52 divide-y divide-solid divide-ink-300 overflow-y-scroll">
      <list-item
        v-for="repo in starredRepos"
        :key="repo.id"
        :to="generateLink(repo)"
        :icon="repo.isPrivate ? 'z-lock' : 'globe'"
        class="px-4 py-3"
      >
        <template #label>
          <div class="flex items-center space-x-3">
            <span>
              {{ repo.name }}
            </span>
            <span
              v-if="repo.availableAnalyzers && repo.availableAnalyzers.edges"
              class="hidden space-x-3 xs:flex"
            >
              <analyzer-logo
                v-for="edge in repo.availableAnalyzers.edges"
                :key="edge.node.name"
                v-bind="edge.node"
              />
            </span>
          </div>
        </template>
        <template #info>
          <span v-tooltip="formatDate(repo.lastAnalyzedAt, 'lll')">{{
            repo.lastAnalyzedAt ? getHumanizedTimeFromNow(repo.lastAnalyzedAt) : ''
          }}</span>
        </template>
      </list-item>
    </ul>
  </list-section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ListSection } from '@/components/TeamHome'
import { getHumanizedTimeFromNow, formatDate } from '@/utils/date'

import { Repository } from '~/types/types'
import ActiveUserMixin from '@/mixins/activeUserMixin'
import { resolveNodes } from '~/utils/array'

@Component({
  components: {
    ListSection
  },
  methods: { getHumanizedTimeFromNow, formatDate }
})
export default class StarredRepoList extends mixins(ActiveUserMixin) {
  public isLoading = false

  async fetch(): Promise<void> {
    await this.fetchStarredRepos()
  }

  get starredRepos(): Array<Repository | null> {
    if (this.viewer?.preference?.starredRepositories) {
      return resolveNodes(this.viewer.preference.starredRepositories)
    }
    return []
  }

  generateLink({
    vcsProvider,
    ownerLogin,
    owner,
    name
  }: {
    vcsProvider: string
    ownerLogin: string
    owner: { login: string }
    name: string
  }): string {
    const login = ownerLogin ? ownerLogin : owner.login
    return ['', this.$providerMetaMap[vcsProvider].shortcode, login, name, 'issues'].join('/')
  }
}
</script>
