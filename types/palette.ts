import { Context } from '@nuxt/types/app'
import VueRouter from 'vue-router'

export interface BaseCommandAction {
  id: CommandId
  label: string
  labelHTML?: string
  hint?: string
  shortkey?: string
  keywords?: string[]
  placeholder?: string
  scope?: 'repo' | 'owner'
  commandType?: 'action' | 'divider'
  condition?: (route: Context['route']) => boolean
  action?: (router: VueRouter) => void | CommandAction[] | Promise<void | CommandAction[]>
  parent?: CommandId
  children?: (rotuer: VueRouter) => Promise<CommandAction[]> | CommandAction[]
}

interface CommandActionWithIcon extends BaseCommandAction {
  icon: string
}

interface CommandActionWithImage extends BaseCommandAction {
  image: string
}

export interface InternalCommnadActionWithIcon extends CommandActionWithIcon {
  _routeName?: string
}

export interface InternalCommnadActionWithImage extends CommandActionWithImage {
  _routeName?: string
}

export type CommandAction = CommandActionWithIcon | CommandActionWithImage
export type InternalCommandAction = InternalCommnadActionWithIcon | InternalCommnadActionWithImage
export type CommandId = string

export interface PaletteInterface {
  registerCommands(commands: CommandAction | CommandAction[], key: string): void
  registerGlobalCommands(commands: CommandAction | CommandAction[]): void
  query(searchCandidate: string, route: Context['route']): Promise<CommandAction[]>
  fetchCurrentCommands(route: Context['route']): CommandAction[]
  fetchGlobalCommands(route: Context['route']): CommandAction[]
}
