import { Middleware } from '@nuxt/types'

const validateRoute: Middleware = ({ route, $config, error }) => {
  const validRoutes = [
    ...($config.githubEnabled ? ['gh'] : []),
    ...($config.gitlabEnabled ? ['gl'] : []),
    ...($config.bitbucketEnabled ? ['bb'] : []),
    ...($config.onPrem && $config.githubServerEnabled ? ['ghe'] : [])
  ]

  if (!validRoutes.includes(route.params.provider)) {
    error({ statusCode: 404, message: 'This page is not real' })
  }
}

export default validateRoute
