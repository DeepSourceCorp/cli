<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { stripTrailingSlash } from '~/utils/string'
// Import State & Types
import { RunDetailActions } from '@/store/run/detail'

@Component({
  middleware: [
    async function ({ store, route, error, redirect }) {
      try {
        const { provider, owner, repo, runId } = route.params
        await store.dispatch(`run/detail/${RunDetailActions.FETCH_RUN}`, {
          provider,
          owner,
          name: repo,
          runId
        })
        const { checks } = store.state.run.detail.run

        if (checks?.edges) {
          const code = checks.edges[0].node.analyzer.shortcode
          redirect(302, `${stripTrailingSlash(route.path)}/${code}`)
        }
      } catch {
        error({ statusCode: 404, message: 'This page is not real' })
      }
    }
  ],
  layout: 'repository'
})
export default class RunDetails extends Vue {}
</script>
