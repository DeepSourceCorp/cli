import Fuse from 'fuse.js'

import { CommandAction, InternalCommandAction, PaletteInterface } from '~/types/palette'
import { Inject, Context } from '@nuxt/types/app'

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
   * Search for commands across local and global scope
   * @param {string} searchCandidate
   * @param {Context['route']} route
   *
   * @return {CommandAction[]}
   */
  queryCommands(searchCandidate: string, route: Context['route']): CommandAction[] {
    const engine = new Fuse([...this.commands, ...this.globalCommands], {
      keys: [
        { name: 'shortkey', weight: 0.7 },
        { name: 'label', weight: 0.5 },
        { name: 'keywords', weight: 0.3 }
      ]
    })

    return engine
      .search(searchCandidate)
      .map((result: { item: CommandAction }) => result.item)
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
   *
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
