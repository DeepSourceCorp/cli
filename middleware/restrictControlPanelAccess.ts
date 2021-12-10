import { Middleware } from '@nuxt/types'
import { OrgBaseActions, OrgBaseGetters } from '~/store/control-panel/base'

const restrictControlPanelAccess: Middleware = async ({ store, error, $config }) => {
  if ($config.onPrem)
    try {
      await store.dispatch(`control-panel/base/${OrgBaseActions.IS_VIEWER_SUPERADMIN}`)

      const isViewerSuperadmin =
        store.getters[`control-panel/base/${OrgBaseGetters.IS_VIEWER_SUPERADMIN}`]

      // Prevent user from opening control panel
      if (!isViewerSuperadmin) {
        error({ statusCode: 404, message: 'This page is not real' })
      }
    } catch (e) {}
  else error({ statusCode: 404, message: 'This page is not real' })
}

export default restrictControlPanelAccess
