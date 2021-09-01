<script lang="ts">
import { Context } from '@nuxt/types'

export default {
  middleware: [
    'restrictOnboarding',
    function ({ redirect, route }: Context): void {
      const { provider, login } = route.params
      redirect(`/onboard/${provider}/${login}/issue-type`)
    }
  ],
  meta: {
    auth: {
      strict: true
    }
  }
}
</script>
