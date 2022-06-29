<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { stripTrailingSlash } from '~/utils/string'
// Import State & Types
import { RunDetailActions } from '@/store/run/detail'
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
