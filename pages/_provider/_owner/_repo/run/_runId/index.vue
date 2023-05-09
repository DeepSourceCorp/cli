<template>
  <!-- UI state corresponding to archived runs -->
  <lazy-empty-state-card
    :show-border="true"
    :use-v2="true"
    :webp-image-path="require('~/assets/images/ui-states/runs/no-recent-autofixes.webp')"
    subtitle="We archive all older runs periodically to keep your dashboard lean, clean, and fast."
    title="This Analysis run has been archived"
    class="mt-52 max-w-sm md:max-w-xl"
  />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { stripTrailingSlash } from '~/utils/string'

// Import State & Types
import { RunDetailActions } from '@/store/run/detail'

import { RunTypes } from '~/types/run'
import { Check, Run } from '~/types/types'
import { resolveNodes } from '~/utils/array'

@Component({
  middleware: [
    async function ({ store, route, error, redirect }) {
      const { provider, owner, repo, runId } = route.params
      const runResponse = (await store.dispatch(`run/detail/${RunDetailActions.FETCH_RUN}`, {
        provider,
        owner,
        name: repo,
        runId
      })) as Run | undefined

      // Show the UI state corresponding to archived runs after checking against the error message
      if (
        store.state.run.detail.error.message?.replace('GraphQL error: ', '') ===
        RunTypes.ARCHIVED_RUN
      ) {
        return
      }

      if (runResponse) {
        const { checks } = runResponse
        const code = (resolveNodes(checks) as Check[])?.[0].analyzer?.shortcode
        if (code) {
          redirect(302, `${stripTrailingSlash(route.path)}/${code}`)
          return
        }
      }

      error({ statusCode: 404, message: 'This page is not real' })
    }
  ],
  layout: 'repository'
})
export default class RunDetails extends Vue {}
</script>
