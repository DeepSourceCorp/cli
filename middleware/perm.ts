import { Middleware, Context } from '@nuxt/types'
import { Route } from 'vue-router'
import { ActiveUserActions } from '~/store/user/active'
import { RepoPerms, TeamPerms } from '~/types/permTypes'
import { RepositoryCollaboratorPermission, TeamMemberRoleChoices, User } from '~/types/types'
import { RepositoryDetailActions } from '~/store/repository/detail'
import { DashboardContext } from '~/mixins/activeUserMixin'

const passList = ['github', 'bitbucket', 'gitlab']

interface IPerms {
  repoPerms: Array<RepoPerms[]>
  teamPerms: Array<TeamPerms[]>
}
interface IProviderOwner {
  provider: string
  owner: string
}

export type RouteMetaDataHook = (context: Context) => IProviderOwner

/**
 * Get repository and team permissions from route meta properties
 *
 * @param route {Route}
 * @returns {IPerms}
 */
function getPermsToCheck(route: Route): IPerms {
  // each route will have it's own team perms and repo perms
  const repoPermsArray: Array<RepoPerms[]> = []
  const teamPermsArray: Array<TeamPerms[]> = []

  // we add them to a sinle array and return it to the main function for testing
  route.meta?.forEach((meta: { auth?: { repoPerms: RepoPerms[]; teamPerms: TeamPerms[] } }) => {
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

/**
 * Get hook functions to evaluate from route meta properties
 *
 * @param route {Route}
 * @returns {RouteMetaDataHook[]}
 */
function getHooksToEvaluate(route: Route): RouteMetaDataHook[] {
  const hooks: Array<RouteMetaDataHook> = []

  route.meta?.forEach((meta: { auth?: { metaDataHook: RouteMetaDataHook } }) => {
    if (typeof meta.auth?.metaDataHook === 'function') {
      hooks.push(meta.auth.metaDataHook)
    }
  })

  return hooks
}

/**
 * Get provider and owner information from route params or after evaluating the hook functions
 *
 * @param context {Context}
 * @returns {IProviderOwner}
 */
function getProviderAndOwner(context: Context): IProviderOwner {
  const { route } = context
  let provider = route.params.provider
  let owner = ''

  owner = route.name?.startsWith('onboard-provider-login') ? route.params.login : route.params.owner

  const hooks = getHooksToEvaluate(route)

  hooks.forEach((hookFn) => {
    const result = hookFn(context)

    // Ensure owner and provider is never set to undefined
    owner = result.owner || owner
    provider = result.provider || provider
  })

  return { provider, owner }
}

/**
 * Fetch the repository role for a user
 *
 * @param context {Context}
 * @returns {Promise<RepositoryCollaboratorPermission | void>}
 */
async function getRepoRole(context: Context): Promise<RepositoryCollaboratorPermission | void> {
  const { route, store } = context

  if (!route.name?.startsWith('provider-owner-repo')) {
    return
  }
  const { repo } = route.params
  const { provider, owner } = getProviderAndOwner(context)

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

/**
 * Fetch the team role for a user
 *
 * @param context {Context}
 * @returns {Promise<TeamMemberRoleChoices | void>}
 */
async function getTeamRole(context: Context): Promise<TeamMemberRoleChoices | void> {
  const { provider, owner } = getProviderAndOwner(context)
  const { store } = context

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

/**
 * The perms middleware
 *
 * @param context {Context}
 * @returns {Middleware}
 */
const permsMiddlware: Middleware = async (context: Context) => {
  const { route, error, $gateKeeper } = context

  /**
   * Log error to error reporting tool
   *
   * @param _message
   * @param _repoPerms
   * @param _teamPerms
   */
  const logError = (_message: string, _repoPerms: RepoPerms[][], _teamPerms: TeamPerms[][]) => {
    // ?Integrate error reporting tool here
  }

  if (route.name && passList.includes(route.name)) {
    return
  }

  const { repoPerms, teamPerms } = getPermsToCheck(route)
  if (repoPerms.length || teamPerms.length) {
    let allowRepo = false

    if (repoPerms.length) {
      const role = await getRepoRole(context)
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
          logError('Could not fetch repository role for user', repoPerms, [])
          console.warn('PERM: Could not fetch repository role for user')
        } catch {}
      }
    }

    let allowTeam = false
    if (teamPerms.length) {
      const role = await getTeamRole(context)
      if (role) {
        // Just like repo perms, team perms is handled
        allowTeam = teamPerms.reduce((shouldAllow: boolean, currentPermMap: TeamPerms[]) => {
          return $gateKeeper.team(currentPermMap, role) && shouldAllow
        }, true)
      } else {
        try {
          logError('Could not fetch team role for user', repoPerms, [])
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
