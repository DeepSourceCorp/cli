<script lang="ts">
import { Context } from '@nuxt/types'

export default {
  middleware: [
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
