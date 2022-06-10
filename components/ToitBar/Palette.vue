<template>
  <div class="fixed inset-0 flex items-start justify-center pt-32">
    <div
      ref="command-k-wrapper"
      class="w-full mx-auto overflow-hidden border rounded-lg outline-none sm:w-120 min-h-10 border-ink-100 shadow-double-dark bg-ink-300"
    >
      <div class="p-4 pb-0 border-ink-100" :class="{ 'border-b': commands.length }">
        <div class="space-x-2">
          <span
            v-for="crumb in breadcrumbs"
            :key="crumb"
            class="px-2 py-1 text-xs leading-none rounded-md bg-ink-200 text-vanilla-300"
          >
            {{ crumb }}
          </span>
        </div>
        <input
          v-focus
          ref="palette-search"
          type="text"
          autoComplete="off"
          role="combobox"
          spellCheck="false"
          class="w-full h-12 bg-transparent focus:outline-none placeholder-slate"
          :value="searchCandidate"
          :placeholder="inputPlaceholder"
          @input="setSearchValue"
        />
      </div>
      <div class="overflow-y-scroll max-h-92 hide-scroll">
        <div v-for="(command, index) in commands" :key="command.id">
          <div
            v-if="command.commandType === 'divider'"
            :key="command.id"
            data-command-type="divider"
            class="ml-0.5 first:mt-2 mt-4 px-3.5 py-2 font-semibold tracking-wider uppercase text-xxs text-vanilla-400"
          >
            {{ command.label }}
          </div>
          <command-row
            v-else
            v-bind="command"
            :data-label="command.label"
            :id="buildId(index)"
            :ref="buildId(index)"
            :active="index === activeIndex"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Ref, Watch, mixins } from 'nuxt-property-decorator'
import RepoListMixin from '~/mixins/repoListMixin'
import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'

import { CommandAction } from '~/types/palette'
import { Maybe } from '~/types/types'
import { createKeybindingsHandler } from 'tinykeys'
import { matchSorter } from 'match-sorter'

/**
 * Command palette component
 */
@Component
export default class Palette extends mixins(RepoListMixin, ActiveUserMixin) {
  searchCandidate = ''
  parentCommands: CommandAction[] = []
  childCommands: CommandAction[] = []
  activeIndex = 0
  wrapperOffset = 0
  handler: EventListener
  searchResults: CommandAction[] = []

  @Ref('command-k-wrapper')
  wrapper: HTMLElement

  @Ref('palette-search')
  searchBox: HTMLInputElement

  /**
   * Created hook for Vue
   *
   * @return {void}
   */
  created() {
    // register global commands to the command manager
    this.registerGlobalCommands()

    // Trigger sync repo list query to the web worker
    this.$sendWorkerTask('syncRepoList', {
      login: this.activeOwner,
      provider: this.$providerMetaMap[this.activeProvider].value
    })
  }

  /**
   * Mounted hook
   *
   * @return {void}
   */
  mounted() {
    // The wrapper offset is used to maintain focus for elements not in visibility
    this.wrapperOffset = this.wrapper.offsetHeight + this.wrapper.offsetTop

    // Don't let the background scroll
    document.body.classList.add('overflow-hidden')

    // set the keyboard handler events
    this.setKeyboardEventHandler()
  }

  /**
   * Describe your function
   * @return {any}
   */
  @Watch('$route')
  setKeyboardEventHandler() {
    // Remove any existing event listener
    this.wrapper.removeEventListener('keydown', this.handler)

    const bindings = {
      Escape: this.wrapEvent(() => this.$emit('close')),
      ArrowUp: this.wrapEvent(this._handleArrowUp),
      ArrowDown: this.wrapEvent(this._handleArrowDown),
      Enter: this.wrapEvent(this._handleEnter),
      Backspace: this._handleBackspace,
      Tab: this.wrapEvent(this._handleTab),
      ...this.fetchKeyBindingsFromCommands(),
      'j o i n d e e p s o u r c e': this.wrapEvent(() => {
        window.open('https://deepsource.io/jobs/', '_blank')
      }),
      'w h o i s d u c k n o r r i s': this.wrapEvent(() =>
        window.open('https://www.youtube.com/watch?v=PSHM9Z7HIRQ', '_blank')
      )
    }

    // create and add the event listener
    this.handler = createKeybindingsHandler(bindings)
    this.wrapper.addEventListener('keydown', this.handler)
  }

  /**
   * Fetch key bindings from commands
   *
   * @return {Record<string, (event: KeyboardEvent) => void>}
   */
  fetchKeyBindingsFromCommands(): Record<string, (event: KeyboardEvent) => void> {
    // fetch key bindings from commands
    const bindings: Record<string, (event: KeyboardEvent) => void> = {}
    const commands = [
      ...this.$palette.fetchCurrentCommands(this.$route),
      ...this.$palette.fetchGlobalCommands(this.$route)
    ]

    commands.forEach((cmd) => {
      if (cmd.shortkey) {
        bindings[cmd.shortkey] = this.wrapEvent(async () => await this.executeCommand(cmd))
      }
    })

    return bindings
  }

  /**
   * Destroy event listener and remove overflow class from the body
   *
   * @return {any}
   */
  beforeDestroy() {
    this.wrapper.removeEventListener('keydown', this.handler)
    document.body.classList.remove('overflow-hidden')
  }

  /**
   * Returns a function wrapped in keyboard event handlers to be
   * execute for cmd-k events
   *
   * @param {(event:KeyboardEvent) => void} method
   *
   * @return {(event: KeyboardEvent) => void}
   */
  wrapEvent(method: (event: KeyboardEvent) => void): (event: KeyboardEvent) => void {
    return (event: KeyboardEvent) => {
      event.stopImmediatePropagation()
      event.preventDefault()
      method(event)
      this.searchBox.focus()
    }
  }

  /**
   * Handler for enter key, executes the currently selected command
   *
   * @return {Promise<void>}
   */
  private _handleEnter(): Promise<void> {
    return this.executeCommand(this.currentCommand)
  }

  /**
   * Handle backspace key, backspace lets you move to the previous list
   *
   * @param {KeyboardEvent} event
   * @return {Promise<void>}
   */
  private async _handleBackspace(event: KeyboardEvent): Promise<void> {
    if (this.searchCandidate === '' && this.parentCommands.length) {
      event.stopImmediatePropagation()
      this.parentCommands = this.parentCommands.slice(0, this.parentCommands.length - 1)

      if (this.parentCommands.length) {
        if (this.currentParentCommand && this.currentParentCommand.children) {
          this.childCommands = await this.currentParentCommand.children(this.$router)
          this.searchCandidate = ''
          this.activeIndex = 0
        }
      }
    }
  }

  /**
   * If the current action has children, set the action to parent action
   * and render new commands
   *
   * @return {Promise<void>}
   */
  private async _handleTab(): Promise<void> {
    if (this.currentCommand.children) {
      this._setParentCommand(this.currentCommand)
    }
  }

  /**
   * Trigger the action depending on available options
   *
   * @param {CommandAction} command
   * @return {Promise<void>}
   */
  private async executeCommand(command: CommandAction): Promise<void> {
    if (command.action) {
      command.action(this.$router)
      this.$emit('close')
    } else if (command.children) {
      this._setParentCommand(command)
    }
  }

  /**
   * Set the parent command
   *
   * @param {CommandAction} command
   * @return {Promise<void>}
   */
  private async _setParentCommand(command: CommandAction): Promise<void> {
    if (command.children) {
      this.childCommands = await command.children(this.$router)
      //! Reassign triggers reactivity reliably
      this.parentCommands = [...this.parentCommands, command]
      this.searchCandidate = ''
      this.activeIndex = 0
    }
  }

  /**
   * Handler for arrow down
   * Ensures that the `activeIndex` does not go out of bounds
   *
   * @param {KeyboardEvent} event
   * @return {void}
   */
  private _handleArrowDown(event: KeyboardEvent): void {
    if (this.activeIndex < this.commands.length - 1) {
      this.activeIndex = this.activeIndex + 1
    }

    // skip the command in case it's a non-navigable type
    if (this.currentCommand.commandType === 'divider') {
      this.activeIndex = this.activeIndex + 1
    }

    this._setFocus(event)
  }

  /**
   * Handler for arrow up
   * Ensures that the `activeIndex` does not go out of bounds
   *
   * @param {KeyboardEvent} event
   * @return {void}
   */
  private _handleArrowUp(event: KeyboardEvent): void {
    if (this.activeIndex > 0) {
      this.activeIndex = this.activeIndex - 1
    }

    // skip the command in case it's a non-navigable type
    if (this.currentCommand.commandType === 'divider') {
      this.activeIndex = this.activeIndex - 1
    }

    this._setFocus(event)
  }

  /**
   * Depeding on the location of the element, set focus to the element
   *
   * @param {KeyboardEvent} event
   *
   *  @return {void}
   */
  private _setFocus(event: KeyboardEvent): void {
    const refs = this.$refs[this.buildId(this.activeIndex)]

    if (!(Array.isArray(refs) && refs.length)) return

    const element = (refs[0] as Vue).$el as HTMLElement

    if (event.key === 'ArrowDown' && element.offsetTop > this.wrapperOffset - 60) {
      element.focus()
    } else {
      element.focus()
    }
  }

  get currentParentCommand(): Maybe<CommandAction> {
    return this.parentCommands.at(-1) ?? null
  }

  get currentCommand(): CommandAction {
    return this.commands[this.activeIndex]
  }

  get inputPlaceholder(): string {
    return this.currentParentCommand?.placeholder ?? 'Search or type a command'
  }

  get commands(): CommandAction[] {
    if (this.currentParentCommand && this.childCommands) {
      if (this.searchCandidate) {
        const results = matchSorter(this.childCommands, this.searchCandidate, {
          keys: ['shortkey', 'label', 'keywords']
        })

        return results
      }

      return this.childCommands
    }

    if (this.searchCandidate && this.searchResults) {
      return this.searchResults
    }

    return [
      ...this.$palette.fetchCurrentCommands(this.$route),
      {
        label: 'All Commands',
        id: 'divider-all-commands',
        icon: 'divider',
        commandType: 'divider'
      },
      ...this.$palette.fetchGlobalCommands(this.$route)
    ]
  }

  /**
   * Event handler for search input event
   *
   * @param {InputEvent} e
   * @return {Promise<void>}
   */
  async setSearchValue(e: InputEvent): Promise<void> {
    const target = e.target ? (e.target as HTMLInputElement) : null
    this.searchCandidate = target?.value ?? ''
    this.searchResults = await this.$palette.query(this.searchCandidate, this.$route)
  }

  /**
   * Build id for unique command action, used to access the element via $refs
   *
   * @param {CommandAction} action
   * @return {string}
   */
  buildId(index: Number): string {
    return `search-option-${index}`
  }

  get breadcrumbs(): string[] {
    if (this.parentCommands.length) {
      return this.parentCommands.map((command) => command.label)
    }

    const breadcrumbs = []

    if (this.activeOwner) {
      breadcrumbs.push(this.activeDashboardContext.team_name ?? this.activeDashboardContext.login)
    }

    const { repo } = this.$route.params
    if (repo) breadcrumbs.push(repo)

    return breadcrumbs
  }

  /**
   * Add global commands to the palette
   *
   * @return {void}
   */
  registerGlobalCommands(): void {
    const { provider, owner } = this.$route.params

    this.$palette.registerGlobalCommands([
      {
        id: 'global-open-repo-list',
        label: `Open Repository`,
        placeholder: `Search or select a repository`,
        icon: `corner-up-right`,
        shortkey: 'Alt+KeyR',
        children: () => {
          return this.$paletteManager.getRepositories(this.$route)
        }
      },
      {
        id: 'global-switch-active-organization',
        label: `Switch Organization`,
        placeholder: `Search or select an organization`,
        icon: `repeat`,
        shortkey: 'Alt+KeyO',
        condition: () => {
          return this.viewer.dashboardContext.length > 1
        },
        children: () => {
          return this.viewer.dashboardContext.map((context: DashboardContext) => {
            return {
              id: `open-${context.id}`,
              label: context.team_name ?? context.login,
              hint: context.vcs_provider_display,
              image: context.avatar_url,
              action: () => {
                this.$router.push(['', context.vcs_provider, context.login].join('/'))
              }
            }
          })
        }
      },
      {
        id: 'global-open-dashboard',
        label: `Team Home`,
        icon: `home`,
        shortkey: 'Alt+KeyH',
        condition: (route) => {
          return this.activeDashboardContext.type === 'team' && route.name !== 'provider-owner'
        },
        action: () => {
          this.$router.push(['', provider, owner].join('/'))
        }
      },
      {
        id: 'global-open-org-settings',
        label: `Organization Settings`,
        icon: `settings`,
        condition: (route) => {
          return !route.name?.startsWith('provider-owner-settings')
        },
        action: () => {
          this.$router.push(['', provider, owner, 'settings'].join('/'))
        }
      },
      {
        id: 'global-contact-support',
        label: `Get Help`,
        icon: `support`,
        action: () => {
          this.$router.push('/support')
        }
      },
      {
        id: 'global-view-changelog',
        label: `View Changelog`,
        icon: `hash`,
        action: () => {
          window.open('https://roadmap.deepsource.io/changelog', '_blank')
        }
      }
    ])
  }
}
</script>
