<template>
  <z-alert type="info" class="border border-robin border-opacity-10">
    <div class="flex items-baseline gap-x-2">
      <z-icon icon="solid-alert-circle" color="robin-400" size="x-small" class="flex-shrink-0" />
      <div class="space-y-3">
        <span class="text-robin-300 text-sm leading-7"
          >The repository you’re looking for might not have been synced. You can manually sync the
          repository to DeepSource.</span
        >
        <div class="space-y-1">
          <div class="flex flex-wrap gap-y-2 sm:flex-nowrap">
            <z-input
              v-model="repoToSync"
              :show-border="false"
              padding="p-0 px-3"
              placeholder="Enter the repository name"
              class="text-xs leading-5 border border-ink-200 sm:rounded-r-none sm:border-r-0"
            />
            <button
              :disabled="loading"
              :class="{ 'opacity-50 cursor-not-allowed': loading }"
              class="py-3 px-6 flex gap-x-1 w-full sm:w-auto items-center justify-center flex-shrink-0 bg-ink-300 text-xs leading-3 text-vanilla-100 rounded-sm sm:rounded-l-none border border-ink-200"
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

          <span v-if="errorMessage" class="text-cherry-500 text-xs leading-5">
            {{ errorMessage }}
          </span>
        </div>
      </div>
    </div>
  </z-alert>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZAlert, ZInput, ZIcon } from '@deepsource/zeal'

@Component({
  components: { ZAlert, ZInput, ZIcon }
})
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
