<template>
  <div class="fixed inset-0 flex items-start pt-40 bg-black bg-opacity-10">
    <transition
      enter-active-class="transition-all duration-100 ease-in-out"
      leave-active-class="transition-all duration-100 ease-in-out"
      enter-class="translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
      leave-to-class="translate-y-full sm:translate-y-0 sm:scale-105 sm:opacity-0"
    >
      <div
        class="w-full m-2 border shadow-double-dark rounded-xl sm:mb-12 border-ink-50 bg-ink-400 transform-gpu sm:w-auto md:mx-auto"
      >
        <div class="w-full rounded-lg outline-none sm:w-120 min-h-10">
          <div class="p-4 pb-0 border-b border-ink-100">
            <div class="space-x-2">
              <span
                v-if="$route.params.owner"
                class="px-2 py-1 text-xs leading-none rounded-md bg-ink-200 text-vanilla-300"
              >
                {{
                  activeDashboardContext.team_name ||
                  activeDashboardContext.login ||
                  $route.params.owner
                }}
              </span>
              <span
                v-if="parentStepLabel"
                class="px-2 py-1 text-xs leading-none rounded-md bg-ink-200 text-vanilla-300"
              >
                {{ parentStepLabel }}
              </span>
            </div>
            <input
              type="text"
              v-focus
              v-model="searchCandidate"
              ref="quick-bar-search"
              placeholder="Search or type a command"
              class="w-full h-12 bg-transparent focus:outline-none placeholder-slate"
            />
          </div>
          <div class="space-y-4 overflow-y-scroll p- hide-scroll max-h-92">
            <commands-wrapper v-if="searchResults.length">
              <command-row
                v-for="command in searchResults"
                :key="command.id"
                v-bind="command"
                :ref="buildId(command)"
                :active="currentCommand && currentCommand.id === command.id"
              />
            </commands-wrapper>
            <commands-wrapper v-else-if="stepTwoCommands.length">
              <command-row
                v-for="command in stepTwoCommands"
                :key="command.id"
                v-bind="command"
                :ref="buildId(command)"
                :active="currentCommand && currentCommand.id === command.id"
              />
            </commands-wrapper>
            <template v-else>
              <commands-wrapper v-if="suggestedCommands.length">
                <command-row
                  v-for="command in suggestedCommands"
                  :key="command.id"
                  v-bind="command"
                  :ref="buildId(command)"
                  :active="currentCommand && currentCommand.id === command.id"
                />
              </commands-wrapper>
              <commands-wrapper title="all commands" v-if="globalCommands.length">
                <command-row
                  v-for="command in globalCommands"
                  :key="command.id"
                  v-bind="command"
                  :ref="buildId(command)"
                  :active="currentCommand && currentCommand.id === command.id"
                />
              </commands-wrapper>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import { Vue, Component, mixins } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { CommandAction } from '~/types/palette'
import { Maybe, Repository } from '~/types/types'
import RepoListMixin from '~/mixins/repoListMixin'
import Fuse from 'fuse.js'
import { resolveNodes } from '~/utils/array'
import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'

/**
 * Command palette component
 */
@Component({
  components: {
    ZIcon
  }
})
export default class Palette extends mixins(RepoListMixin, ActiveUserMixin) {
  public cursor = 0
  public searchCandidate = ''
  public parentStepLabel = ''
  public stepTwoCommands: CommandAction[] = []
  public currentCommand: Maybe<CommandAction> = null
  public suggestedCommands: CommandAction[] = []
  public searchResults: CommandAction[] = []
  public globalCommands: CommandAction[] = []

  get hasOptions(): boolean {
    return true
  }

  /**
   * Build id for unique command action, used to access the element via $refs
   *
   * @param {CommandAction} action
   * @return {string}
   */
  buildId(action: CommandAction): string {
    return `search-option-${action.id}`
  }

  /**
   * Set command as active and focus on it
   *
   * @param {number} cursor
   *
   * @return {void}
   */
  setActive(cursor: number): void {
    const commands = this.currentCommandList
    if (cursor in commands) {
      this.cursor = cursor
      this.currentCommand = commands[cursor]

      const refs = this.$refs[this.buildId(this.currentCommand)]
      if (Array.isArray(refs) && refs.length) {
        const component = refs[0] as Vue
        ;(component.$el as HTMLElement).focus()
      }
    }
  }

  /**
   * reset pallete, search, step two commands and set focus to first element
   *
   * @return {void}
   */
  resetPalette(): void {
    this.registerGlobalCommands()
    this.suggestedCommands = this.$palette.fetchCurrentCommands(this.$route)
    this.globalCommands = this.$palette.fetchGlobalCommands(this.$route)
    this.searchResults = []
    this.stepTwoCommands = []
    this.parentStepLabel = ''
    this.searchCandidate = ''
    this.setFocus()
    this.setActive(0)
  }

  get currentCommandList(): CommandAction[] {
    if (this.stepTwoCommands.length) {
      return this.stepTwoCommands
    }

    if (this.searchCandidate) {
      return this.searchResults
    }

    return [...this.suggestedCommands, ...this.globalCommands]
  }

  /**
   * Keydown handler for searching and navigation
   *
   * @param {KeyboardEvent} e
   *
   * @return {void}
   */
  keydownHandler(e: KeyboardEvent): void {
    if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
      e.preventDefault()
      e.stopPropagation()

      const totalItems = this.currentCommandList.length

      if (e.key === 'ArrowUp' && this.cursor > 0) {
        this.setActive(this.cursor - 1)
      } else if (e.key === 'ArrowDown' && this.cursor <= totalItems) {
        this.setActive(this.cursor + 1)
      } else if (e.key === 'Enter') {
        this._triggerAction(e)
      }
    } else if (e.altKey) {
      this._handleAltKeyAction(e)
    } else if (e.code === 'KeyK' && e.metaKey === true) {
      this._toggle(e)
    } else if (e.key === 'Escape') {
      if (this.stepTwoCommands.length) {
        this.resetPalette()
      } else {
        this._close(e)
      }
    } else {
      this.searchResults = this.fetchSearchResults()
      this.setActive(0)
      this.setFocus()
    }
  }

  /**
   * Trigger a command action or second step
   *
   * @param {KeyboardEvent} e
   *
   * @return {any}
   */
  _triggerAction(e: KeyboardEvent) {
    if (this.currentCommand?.commandType === 'list') {
      this.stepTwoCommands = this.currentCommand.action() as CommandAction[]
      this.parentStepLabel = this.currentCommand.label

      this.searchCandidate = ``
      this.searchResults = []
      this.setActive(0)
    } else {
      this.currentCommand?.action()
      this.resetPalette()
      this.$emit('close')
    }
  }

  /**
   * Toggle the palette
   *
   * @param {KeyboardEvent} e
   *
   * @return {any}
   */
  _toggle(e: KeyboardEvent) {
    this.resetPalette()
    this.$emit('toggle')
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * close the palette
   *
   * @param {KeyboardEvent} e
   *
   * @return {any}
   */
  _close(e: KeyboardEvent) {
    this.resetPalette()
    this.$emit('close')
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * Special handler for Alt key presses, these are shortkeys to trigger an action
   *
   * @param {KeyboardEvent} e
   *
   * @return {any}
   */
  _handleAltKeyAction(e: KeyboardEvent) {
    const keys = [...this.suggestedCommands, ...this.globalCommands].filter((cmd) => {
      return (
        Array.isArray(cmd.shortkey) &&
        cmd.shortkey[0].toLowerCase() === 'opt' &&
        `Key${cmd.shortkey[1]}`.toLowerCase() === e.code.toLowerCase()
      )
    })

    if (keys.length) {
      this.currentCommand = keys[0]
      this._triggerAction(e)
      this.searchCandidate = ''
    }
  }

  /**
   * Mounted hook
   *
   * @return {any}
   */
  mounted() {
    document.addEventListener('keydown', this.keydownHandler)
    this.$nextTick(this.resetPalette)
  }

  /**
   * Focus utility
   *
   * @return {any}
   */
  setFocus() {
    ;(this.$refs['quick-bar-search'] as HTMLInputElement).focus()
  }

  /**
   * Before destroy hook
   *
   * @return {void}
   */
  beforeDestroy(): void {
    document.removeEventListener('keydown', this.keydownHandler)
  }

  /**
   * Fetch search results for the command
   *
   * @return {CommandAction[]}
   */
  fetchSearchResults(): CommandAction[] {
    if (this.stepTwoCommands.length) {
      const engine = new Fuse(this.stepTwoCommands, {
        keys: [{ name: 'label', weight: 1 }]
      })
      return engine.search(this.searchCandidate).map((result) => result.item)
    }

    return this.searchCandidate ? this.$palette.query(this.searchCandidate, this.$route) : []
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
        id: 'open-repo-list',
        label: `Open Repository`,
        icon: `corner-up-right`,
        commandType: 'list',
        shortkey: ['Opt', 'R'],
        action: () => {
          return (resolveNodes(this.repositoryList) as Repository[]).map((repo) => {
            return {
              id: `open-${repo.id}`,
              label: repo.name,
              icon: repo.isPrivate ? 'lock' : 'globe',
              action: () => {
                this.$router.push(['', provider, owner, repo.name].join('/'))
              }
            }
          })
        }
      },
      {
        id: 'switch-active-organization',
        label: `Switch Organization`,
        icon: `repeat`,
        commandType: 'list',
        shortkey: ['Opt', 'O'],
        condition: () => {
          return this.viewer.dashboardContext.length > 1
        },
        action: () => {
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
        id: 'open-dashboard',
        label: `Team Home`,
        icon: `home`,
        shortkey: ['Opt', 'H'],
        condition: (route) => {
          return route.name !== 'provider-owner'
        },
        action: () => {
          this.$router.push(['', provider, owner].join('/'))
        }
      },
      {
        id: 'open-org-settings',
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
        id: 'contact-support',
        label: `Get Help`,
        icon: `support`,
        action: () => {
          this.$router.push('/support')
        }
      },
      {
        id: 'view-changelog',
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
