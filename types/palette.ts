import { Context } from '@nuxt/types/app'

export interface BaseCommandAction {
  id: CommandId
  label: string
  hint?: string
  shortkey?: string[] | string
  keywords?: string[]
  scope?: 'repo' | 'owner'
  commandType?: 'list' | 'action'
  condition?: (route: Context['route']) => boolean
  action: () => void | Promise<void> | Promise<CommandAction[]> | CommandAction[]
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
  query(searchCandidate: string, route: Context['route']): CommandAction[]
  fetchCurrentCommands(route: Context['route']): CommandAction[]
  fetchGlobalCommands(route: Context['route']): CommandAction[]
}
