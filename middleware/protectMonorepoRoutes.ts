import { Middleware } from '@nuxt/types'

import { RepositoryDetailActions } from '~/store/repository/detail'
import { RepositoryKindChoices } from '~/types/types'

const protectMonorepoRoutes: Middleware = async ({ error, route, store, $logErrorAndToast }) => {
  if (!store.state.repository.detail.repository.kind) {
    const { provider, owner, repo: name } = route.params

    try {
      await store.dispatch(`repository/detail/${RepositoryDetailActions.FETCH_REPOSITORY_KIND}`, {
        provider,
        owner,
        name
      })
    } catch (err) {
      $logErrorAndToast(err as Error)
    }
  }

  const { kind } = store.state.repository.detail.repository

  const currentRouteName = route.name as string

  if (kind === RepositoryKindChoices.Monorepo) {
    // Route names which should have an exact match
    const allowedRouteNames = [
      'provider-owner-repo',
      'provider-owner-repo-projects',
      'provider-owner-repo-settings',
      'provider-owner-repo-settings-general',
      'provider-owner-repo-settings-autofix',
      'provider-owner-repo-settings-ssh-access',
      'provider-owner-repo-settings-audit-log',
      'provider-owner-repo-settings-repo-members'
    ]

    if (!allowedRouteNames.includes(currentRouteName)) {
      error({ statusCode: 404 })
    }
  }

  if (kind === RepositoryKindChoices.Subrepo) {
    // Route names which should have an exact match
    const allowedRouteNames = [
      'provider-owner-repo',
      'provider-owner-repo-issues',
      'provider-owner-repo-settings',
      'provider-owner-repo-settings-general',
      'provider-owner-repo-settings-config',
      'provider-owner-repo-settings-code-coverage',
      'provider-owner-repo-settings-reporting',
      'provider-owner-repo-settings-issue-priority',
      'provider-owner-repo-settings-badges',
      'provider-owner-repo-settings-ignore-rules',
      'provider-owner-repo-settings-audit-log',
      'provider-owner-repo-settings-integrations'
    ]

    // Excluding `provider-owner-repo-settings` since not all views are permitted for a `Sub-repository`
    // These are partial matches where all the n-level child routes are allowed
    const routeNamesWithSubRoutes = [
      'provider-owner-repo-issue',
      'provider-owner-repo-autofix',
      'provider-owner-repo-metrics',
      'provider-owner-repo-reports',
      'provider-owner-repo-history',
      'provider-owner-repo-run',
      'provider-owner-repo-transform'
    ]

    if (
      allowedRouteNames.includes(currentRouteName) ||
      routeNamesWithSubRoutes.some((routeName: string) => currentRouteName.startsWith(routeName))
    ) {
      return
    }

    error({ statusCode: 404 })
  }
}

export default protectMonorepoRoutes
