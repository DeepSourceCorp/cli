<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { DashboardContext } from '~/mixins/activeUserMixin'
import { VantaCookieKeys } from '~/mixins/integrationsDetailMixin'

import { ActiveUserActions, ActiveUserGetterTypes } from '~/store/user/active'

import { User } from '~/types/types'

@Component({
  middleware: [
    'auth',
    async ({ store, redirect, $cookies }) => {
      await store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)

      const viewer = store.getters[`user/active/${ActiveUserGetterTypes.GET_VIEWER}`] as User

      const owner = $cookies.get(VantaCookieKeys.OWNER)
      const provider = $cookies.get(VantaCookieKeys.PROVIDER)

      let activeContext = viewer.dashboardContext?.[0] as DashboardContext
      if (owner && provider) {
        activeContext = viewer.dashboardContext?.find((context: DashboardContext) => {
          return context.vcs_provider === provider && context.login === owner
        })
      }

      if (activeContext) {
        // If the default context is an individual: redirect to the default overview page
        if (activeContext.type === 'user') {
          redirect(302, `/${String(provider)}/${String(owner)}`)
        }

        // If the default context is team: redirect to Vanta integration page
        redirect(302, `/${provider}/${owner}/settings/integrations/vanta`)
      }

      redirect(302, '/dashboard')
    }
  ],
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class GlobalURLRedirectVantaIntegration extends Vue {}
</script>
