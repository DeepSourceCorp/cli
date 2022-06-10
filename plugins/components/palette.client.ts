import { CommandAction, InternalCommandAction, PaletteInterface } from '~/types/palette'
import { Inject, Context } from '@nuxt/types/app'
import { DBStores, getDB } from '../helpers/storage.client'
import { Route } from 'vue-router'
import { providerMetaMap } from '../helpers/provider'
import { Repository } from '~/types/types'
import { matchSorter } from 'match-sorter'

declare module 'vuex/types/index' {
  // skipcq: JS-0356
  interface Store<S> {
    $palette: PaletteInterface
    $paletteManager: CommandManager
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $palette: PaletteInterface
    $paletteManager: CommandManager
  }
  interface Context {
    $palette: PaletteInterface
    $paletteManager: CommandManager
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $palette: PaletteInterface
    $paletteManager: CommandManager
  }
}
/**
 * Command Manager class that allows searching and ranking commands
 */
export class CommandManager {
  commands: InternalCommandAction[]
  globalCommands: InternalCommandAction[]

  constructor() {
    this.commands = []
    this.globalCommands = []
  }

  /**
   * Add commands to internal directory
   *
   * @param {CommandAction[]|CommandAction} commands
   * @param {boolean} global?
   * @param {string} routeName?
   *
   * @return {void}
   */
  add(commands: CommandAction[] | CommandAction, global?: boolean, routeName?: string): void {
    commands = Array.isArray(commands) ? commands : [commands]
    const searchList = global ? this.globalCommands : this.commands
    commands.forEach((command) => {
      const currentCommandIndex = searchList.findIndex((cmd) => cmd.id === command.id)
      if (currentCommandIndex === -1) {
        const commandToPush = {
          ...command,
          _routeName: routeName
        }

        global ? this.globalCommands.push(commandToPush) : this.commands.push(commandToPush)
      } else {
        global
          ? (this.globalCommands[currentCommandIndex] = command)
          : (this.commands[currentCommandIndex] = command)
      }
    })
  }

  /**
   * Get a list of repositories with custom actions
   *
   * @param {Route} {params} - current route params
   *
   * @return {Promise<CommandAction[]>}
   */
  async getRepositories({ params }: Route): Promise<CommandAction[]> {
    const { value } = providerMetaMap[params.provider]
    const db = getDB(`${value}/${params.owner}`)
    const repoStore = db[DBStores.REPOSITORIES]
    const repoActionList: CommandAction[] = []

    const { provider, owner } = params

    const repoPages = [
      { label: 'Overview', icon: 'tachometer-fast', route: '' },
      { label: 'Issues', icon: 'flag', route: 'issues' },
      { label: 'Autofix', icon: 'autofix', route: 'autofix' },
      { label: 'Metrics', icon: 'bar-chart', route: 'metrics' },
      { label: 'Analysis history', icon: 'history', route: 'history/runs' },
      { label: 'Transform history', icon: 'history', route: 'history/transforms' },
      { label: 'Settings', icon: 'settings', route: 'settings/general' }
    ]

    await repoStore.iterate((repo: Repository) => {
      if (repo.isActivated) {
        repoActionList.push({
          id: `open-${repo.id}`,
          label: `${repo.ownerLogin}/${repo.name}`, // skipcq: JS-0378
          placeholder: `Select repository page to open`,
          hint: `Press <kbd class="cmd-kbd">Enter</kbd> to jump, <kbd class="cmd-kbd">Tab</kbd> to browse`,
          icon: repo.isPrivate ? 'lock' : 'globe',
          keywords: [repo.name],
          action: (router) => {
            router.push(['', provider, owner, repo.name].join('/'))
          },
          children: () => {
            return repoPages.map((page) => {
              return {
                id: `open-${repo.id}-${page.label}`,
                label: page.label,
                icon: page.icon,
                action: (router) => {
                  router.push(['', provider, owner, repo.name, page.route].join('/'))
                }
              }
            })
          }
        })
      }
    })

    return repoActionList
  }

  /**
   * Search for commands across local and global scope
   * @param {string} searchCandidate
   * @param {Context['route']} route
   *
   * @return {CommandAction[]}
   */
  async queryCommands(searchCandidate: string, route: Context['route']): Promise<CommandAction[]> {
    const repos = await this.getRepositories(route)

    const results = matchSorter(
      [...repos, ...this.commands, ...this.globalCommands],
      searchCandidate,
      {
        keys: ['shortkey', 'label', 'keywords']
      }
    )

    return results
      .filter((cmd: CommandAction) => this._validateConditionAndScope(cmd, route))
      .sort((firstCommand, secondCommand) => {
        return this._sortCompareFn(secondCommand, route) - this._sortCompareFn(firstCommand, route)
      })
  }

  /**
   * Ensure the commands are visible only for thier scope and the condition is met
   *
   * @param {CommandAction} command
   * @param {Context['route']} route
   
   * @return {boolean}
   */
  _validateConditionAndScope(command: CommandAction, route: Context['route']): boolean {
    if (command.scope === 'repo' && !route.name?.startsWith('provider-owner-repo')) {
      return false
    }

    if (command.scope === 'owner' && route.name?.startsWith('provider-owner-repo')) {
      return false
    }

    if (command.condition) {
      return command.condition(route)
    }
    return true
  }

  /**
   * sort compare function that generates the rank based on the route
   *
   * @param {InternalCommandAction} command
   * @param {Context['route']} route
   *
   * @return {number}
   */
  _sortCompareFn(command: InternalCommandAction, route: Context['route']): number {
    if (route.name && command._routeName) {
      switch (true) {
        case command._routeName === route.name:
          return 1
        case route.name.startsWith(command._routeName ?? ''):
          return 1 - (route.name.length - command._routeName.length) / route.name.length
        default:
          return 0
      }
    }

    return 0
  }

  /**
   * Get commands for the current scope
   *
   * @param {Context['route']} route
   *
   * @return {CommandAction[]}
   */
  getCurrentCommands(route: Context['route']): CommandAction[] {
    return this.commands
      .filter((cmd) => this._validateConditionAndScope(cmd, route))
      .sort((firstCommand, secondCommand) => {
        return this._sortCompareFn(secondCommand, route) - this._sortCompareFn(firstCommand, route)
      })
  }

  /**
   * Get globally defined commands
   *
   * @param {Context['route']} route
   *
   * @return {CommandAction[]}
   */
  getGlobalCommands(route: Context['route']): CommandAction[] {
    return this.globalCommands
      .filter((cmd) => this._validateConditionAndScope(cmd, route))
      .sort((firstCommand, secondCommand) => {
        return this._sortCompareFn(secondCommand, route) - this._sortCompareFn(firstCommand, route)
      })
  }
}

export default (_: Context, inject: Inject): void => {
  const manager = new CommandManager()

  const palette: PaletteInterface = {
    registerCommands(commands: CommandAction[] | CommandAction, key) {
      manager.add(commands, false, key)
    },
    registerGlobalCommands(commands: CommandAction[] | CommandAction) {
      manager.add(commands, true)
    },
    fetchCurrentCommands(route) {
      return manager.getCurrentCommands(route)
    },
    fetchGlobalCommands(route) {
      return manager.getGlobalCommands(route)
    },
    query(searchCandidate: string, route) {
      return manager.queryCommands(searchCandidate, route)
    }
  }

  inject('palette', palette)
  inject('paletteManager', manager)
}
