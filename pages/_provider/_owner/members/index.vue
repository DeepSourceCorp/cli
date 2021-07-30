<script lang="ts">
import { Context } from '@nuxt/types'

export default {
  middleware: [
    function ({ redirect, route }: Context): void {
      const { provider, owner } = route.params
      redirect(`/${provider}/${owner}/members/active`)
    }
  ]
}
</script>
