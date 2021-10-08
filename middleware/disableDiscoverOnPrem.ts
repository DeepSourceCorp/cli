import { Middleware } from '@nuxt/types'

const disableDiscoverOnPrem: Middleware = ({ $config, error }) => {
  if ($config.onPrem && !$config.discoverEnabled) {
    error({ statusCode: 404, message: 'This page is not real' })
  }
}

export default disableDiscoverOnPrem
