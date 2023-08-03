<template>
  <z-alert type="info" class="border border-robin border-opacity-10">
    <div class="flex items-baseline gap-x-2">
      <z-icon icon="solid-alert-circle" color="robin-400" size="x-small" class="flex-shrink-0" />
      <div class="space-y-3">
        <span class="text-sm leading-7 text-robin-300"
          >The repository you’re looking for might not have been synced with DeepSource. You can try
          syncing it manually.</span
        >
        <div class="space-y-1">
          <div class="flex flex-wrap gap-y-2 sm:flex-nowrap">
            <z-input
              v-model="repoToSync"
              :show-border="false"
              padding="p-0 px-3"
              placeholder="Enter the repository name"
              class="border border-ink-200 text-xs leading-5 sm:rounded-r-none sm:border-r-0"
            />
            <button
              :disabled="loading"
              :class="{ 'cursor-not-allowed opacity-50': loading }"
              class="flex w-full flex-shrink-0 items-center justify-center gap-x-1 rounded-sm border border-ink-200 bg-ink-300 px-6 py-3 text-xs leading-3 text-vanilla-100 sm:w-auto sm:rounded-l-none"
              @click="$emit('sync-repo', repoToSync)"
            >
              <z-icon
                :icon="loading ? 'spin-loader' : 'repositories'"
                color="vanilla-100"
                size="x-small"
                :class="{ 'animate-spin': loading }"
              />
              <span>Sync repository</span>
            </button>
          </div>

          <span v-if="errorMessage" class="text-xs leading-5 text-cherry-500">
            {{ errorMessage }}
          </span>
        </div>
      </div>
    </div>
  </z-alert>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component({})
export default class SyncRepoAlert extends Vue {
  @Prop({ default: false })
  loading: boolean

  @Prop({ default: '' })
  initialRepoName: string

  @Prop({ default: '' })
  errorMessage: string

  repoToSync = ''

  /**
   * Created hook for the component.
   * Sets inital value for repoTosSync data property based on prop value passed.

   * @returns {void}
   */
  created(): void {
    this.repoToSync = this.initialRepoName
  }
}
</script>
