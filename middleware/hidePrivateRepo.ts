import { Middleware } from '@nuxt/types'
import { AuthGetterTypes } from '~/store/account/auth'
import { RepositoryDetailActions } from '~/store/repository/detail'

const hidePrivateRepos: Middleware = async ({ error, redirect, route, store }) => {
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
    if (store.getters[`account/auth/${AuthGetterTypes.GET_LOGGED_IN}`]) {
      error({ statusCode: 404 })
      return
    }

    redirect(302, '/login', {
      next: route.fullPath
    })
  }
}

export default hidePrivateRepos
