import { Middleware } from '@nuxt/types'
import { Store } from 'vuex'
import { Route } from 'vue-router'
import { ActiveUserActions } from '~/store/user/active'
import { RepoPerms, TeamPerms } from '~/types/permTypes'
import { RepositoryCollaboratorPermission, TeamMemberRoleChoices, User } from '~/types/types'
import { RepositoryDetailActions } from '~/store/repository/detail'
import { DashboardContext } from '~/mixins/activeUserMixin'

const passList = ['github', 'bitbucket', 'gitlab']

function getPermsToCheck(
  route: Route
): {
  repoPerms: Array<RepoPerms[]>
  teamPerms: Array<TeamPerms[]>
} {
  // each route will have it's own team perms and repo perms
  const repoPermsArray: Array<RepoPerms[]> = []
  const teamPermsArray: Array<TeamPerms[]> = []

  // we add them to a sinle array and return it to the main function for testing
  route.meta.forEach((meta: { auth?: { repoPerms: RepoPerms[]; teamPerms: TeamPerms[] } }) => {
    if (meta?.auth?.repoPerms && Array.isArray(meta.auth.repoPerms)) {
      repoPermsArray.push(meta.auth.repoPerms)
    }
    if (meta?.auth?.teamPerms && Array.isArray(meta.auth.teamPerms)) {
      teamPermsArray.push(meta.auth.teamPerms)
    }
  })

  return {
    repoPerms: repoPermsArray,
    teamPerms: teamPermsArray
  }
}

async function getRepoRole(
  route: Route,
  store: Store<any>
): Promise<RepositoryCollaboratorPermission | void> {
  if (!route.name?.startsWith('provider-owner-repo')) {
    return
  }
  const { provider, owner, repo } = route.params

  if (provider && owner && repo) {
    if (!store.state.repository.detail.repositoryuserPermissionMeta) {
      await store.dispatch(`repository/detail/${RepositoryDetailActions.FETCH_REPOSITORY_PERMS}`, {
        provider,
        owner,
        name: repo
      })
    }

    if (store.state.repository.detail.repository.userPermissionMeta?.permission) {
      return store.state.repository.detail.repository.userPermissionMeta?.permission
    }
  }
}
async function getTeamRole(route: Route, store: Store<any>): Promise<TeamMemberRoleChoices | void> {
  let provider = ''
  let owner = ''

  if (route.name?.startsWith('onboard-provider-login')) {
    provider = route.params.provider
    owner = route.params.login
  } else {
    provider = route.params.provider
    owner = route.params.owner
  }

  await store.dispatch(`user/active/${ActiveUserActions.FETCH_VIEWER_INFO}`)
  const viewer = store.state.user.active.viewer as User

  if (viewer.dashboardContext && owner && provider) {
    const activeContext = viewer.dashboardContext.filter((context: DashboardContext) => {
      return context.vcs_provider === provider && context.login === owner
    })

    if (activeContext.length) {
      return activeContext[0].role
    }
  }
}

const permsMiddlware: Middleware = async ({ store, route, error, $gateKeeper, $sentry }) => {
  const logSentry = (message: string, repoPerms: RepoPerms[][], teamPerms: TeamPerms[][]) => {
    const viewer = store.state.user.active.viewer as User
    $sentry.withScope(() => {
      $sentry.setUser({ email: viewer.email })
      $sentry.setContext('Permission Meta', {
        path: route.fullPath,
        repoPerms: repoPerms.map((perm) => perm.join(', ')),
        teamPerms: teamPerms.map((perm) => perm.join(', '))
      })
      $sentry.captureMessage(message)
    })
  }

  if (route.name && passList.includes(route.name)) {
    return
  }

  const { repoPerms, teamPerms } = getPermsToCheck(route)
  if (repoPerms.length || teamPerms.length) {
    let allowRepo = false

    if (repoPerms.length) {
      const role = await getRepoRole(route, store)
      if (role) {
        // I know, reduce is not great, but hear me out.
        // We loop over the array of perms, and check if a page perm is not valid.
        // These perms are gonna be arrays containing array perms for each page
        // These pages will always be nested, so if any one of the perms don't match
        // We don't allow.
        allowRepo = repoPerms.reduce((shouldAllow: boolean, currentPermMap: RepoPerms[]) => {
          return $gateKeeper.repo(currentPermMap, role) && shouldAllow
        }, true)
      } else {
        try {
          logSentry('Could not fetch repository role for user', repoPerms, [])
          console.warn('PERM: Could not fetch repository role for user')
        } catch {}
      }
    }

    let allowTeam = false
    if (teamPerms.length) {
      const role = await getTeamRole(route, store)
      if (role) {
        // Just like repo perms, team perms is handled
        allowTeam = teamPerms.reduce((shouldAllow: boolean, currentPermMap: TeamPerms[]) => {
          return $gateKeeper.team(currentPermMap, role) && shouldAllow
        }, true)
      } else {
        try {
          logSentry('Could not fetch team role for user', repoPerms, [])
          console.warn('PERM: Could not fetch team role for user')
        } catch {}
      }
    }

    if (repoPerms.length && teamPerms.length) {
      // if both are false
      if (!allowRepo && !allowTeam) {
        error({ statusCode: 404, message: 'This page is not real' })
      }
    } else if (repoPerms.length) {
      if (!allowRepo) {
        error({ statusCode: 404, message: 'This page is not real' })
      }
    } else if (teamPerms.length) {
      if (!allowTeam) {
        error({ statusCode: 404, message: 'This page is not real' })
      }
    }
  }
}

export default permsMiddlware
