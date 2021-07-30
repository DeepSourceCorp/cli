import { Middleware } from '@nuxt/types'
import { RepositoryDetailActions } from '~/store/repository/detail'

const hidePrivateRepos: Middleware = async ({ store, route, error }) => {
  if (!route.name?.startsWith('provider-owner-repo')) {
    return
  }
  const { provider, owner, repo } = route.params

  try {
    await store.dispatch(
      `repository/detail/${RepositoryDetailActions.FETCH_REPOSITORY_BASE_DETAILS}`,
      {
        provider,
        owner,
        name: repo
      }
    )
  } catch (e) {
    error({ statusCode: 404, message: 'This page is not real' })
  }
}

export default hidePrivateRepos
