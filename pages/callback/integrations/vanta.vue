<script lang="ts">
import { Context } from '@nuxt/types'
import { Component, Vue } from 'nuxt-property-decorator'

import { IntegrationShortcodes, VantaCookieKeys } from '~/mixins/integrationsDetailMixin'

import { IntegrationsDetailActions } from '~/store/integrations/detail'

import { TeamPerms } from '~/types/permTypes'
import { IntegrationInstallationStep, IntegrationSettingsLevel } from '~/types/types'

/**
 * Intermediary page where the integration installation happens
 */
@Component({
  middleware: [
    'perm',
    async function ({ redirect, route, store, $cookies }) {
      // Grab code and state from query params
      const { code, error, state } = route.query as Record<string, string>

      // Grab provider and owner information from cookies
      const provider = $cookies.get(VantaCookieKeys.PROVIDER)
      const owner = $cookies.get(VantaCookieKeys.OWNER)
      const ownerId = $cookies.get(VantaCookieKeys.OWNER_ID)

      // Redirect to the dashboard if any among provider, owner, or owner-id
      // is not set in cookies
      if (!provider || !owner || !ownerId) {
        return redirect('/dashboard')
      }

      const integrationsPagePath = `/${provider}/${owner}/settings/integrations/vanta`

      if (!code || error || !state) {
        // Redirect to the integrations page if there is an error,
        // or if anyone among code or state query params are not available
        return redirect(integrationsPagePath)
      }

      // Trigger the GQL mutation to install the integration
      await store.dispatch(`integrations/detail/${IntegrationsDetailActions.INSTALL_INTEGRATION}`, {
        step: IntegrationInstallationStep.Install,
        shortcode: IntegrationShortcodes.VANTA,
        ownerId,
        code,
        state
      })

      const { nextStep, options } = store.state.integrations.detail.installIntegrationPayload

      // Redirect to the integrations page for Vanta if the user performs a full reload
      // Triggering `installIntegration` GQL mutation `INSTALL` step would fail
      // The code send wouldn’t be valid while exchanging it for an access token
      if (!nextStep || !options) {
        return redirect(integrationsPagePath)
      }

      // Redirect to the integrations page for Vanta if the URL has expired
      if (nextStep === IntegrationInstallationStep.Expired) {
        return redirect(integrationsPagePath)
      }

      await store.dispatch(
        `integrations/detail/${IntegrationsDetailActions.FETCH_INTEGRATION_LOGO_URL}`,
        { shortcode: IntegrationShortcodes.VANTA, level: IntegrationSettingsLevel.Owner, ownerId }
      )
      return undefined
    }
  ],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_INTEGRATIONS],
      metaDataHook: ({ $cookies }: Context) => {
        const provider = $cookies?.get(VantaCookieKeys.PROVIDER) as string
        const owner = $cookies?.get(VantaCookieKeys.OWNER) as string
        return { owner, provider }
      }
    }
  }
})
export default class VantaIntermediaryInstallation extends Vue {}
</script>
