<template>
  <div v-if="editorsPickRepository.id">
    <section-header title="Editor's pick" />

    <div class="p-0.5 rounded-md bg-gradient-dawn">
      <repo-card
        :remove-default-style="true"
        :show-info="false"
        :repo-info="editorsPickRepository"
        class="rounded-sm bg-ink-400"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { DiscoverRepoActions, DiscoverRepoGetters } from '~/store/discover/repositories'
import { Maybe, Repository } from '~/types/types'

import RepoCard from './RepoCard.vue'

const discoverRepositoriesStore = namespace('discover/repositories')

@Component({
  components: {
    RepoCard
  }
})
export default class EditorsPick extends Vue {
  @discoverRepositoriesStore.Getter(DiscoverRepoGetters.GET_EDITORS_PICK_REPOSITORY)
  editorsPickRepository: Maybe<Repository>

  @discoverRepositoriesStore.Action(DiscoverRepoActions.FETCH_EDITORS_PICK_REPOSITORY)
  fetchEditorsPickRepository: (args?: { refetch?: boolean }) => Promise<void>

  async fetch() {
    await this.fetchEditorsPickRepository()
  }
}
</script>
