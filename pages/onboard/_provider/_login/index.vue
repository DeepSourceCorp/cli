<script lang="ts">
import { Context } from '@nuxt/types'
import { TeamPerms } from '~/types/permTypes'

export default {
  middleware: [
    'perm',
    function ({ redirect, route }: Context): void {
      const { provider, login } = route.params
      redirect(`/onboard/${provider}/${login}/issue-type`)
    }
  ],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.ONBOARD_ACCOUNT]
    }
  }
}
</script>
