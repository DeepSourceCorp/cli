import { Component, mixins } from 'nuxt-property-decorator'
import { CommandAction } from '~/types/palette'
import ActiveUserMixin from './activeUserMixin'
import { createKeybindingsHandler } from 'tinykeys'
import AuthMixin from './authMixin'
import { Maybe } from '~/types/types'

const TEXT_INPUT_TYPES = ['TEXTAREA', 'INPUT']
declare module 'vue/types/vue' {
  interface Vue {
    getCommands?: () => CommandAction[]
  }
}

/**
 * Mixin to access and toggle command palette
 */
@Component
export default class PaletteMixin extends mixins(AuthMixin, ActiveUserMixin) {
  showPalette = false
  handler: EventListener

  /**
   * Mount hook for palette
   *
   * @return {void}
   */
  mounted(): void {
    this.setPaletteEvent()
  }

  /**
   * Before destroy hook for palette
   *
   * @return {void}
   */
  beforeDestroy(): void {
    this.removePaletteEvent()
  }

  /**
   * Toggle function for the palette
   *
   * @param {KeyboardEvent}
   *
   * @return {void}
   */
  togglePalette(e: KeyboardEvent): void {
    this.showPalette = !this.showPalette
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * Set the palette event to enable command-k and slash shortcut
   * @return {void}
   */
  setPaletteEvent(): void {
    // Remove any existing event listener
    document.removeEventListener('keydown', this.handler)

    const bindings = {
      '$mod+KeyK': (e: KeyboardEvent) => this.togglePalette(e),
      '/': (e: KeyboardEvent) => {
        const activeElement = document.activeElement
        const activeNodeName = activeElement?.nodeName.toUpperCase()

        if (activeNodeName && TEXT_INPUT_TYPES.includes(activeNodeName)) {
          return
        }

        if ((activeElement as unknown as Maybe<ElementContentEditable>)?.isContentEditable) {
          return
        }

        this.togglePalette(e)
        e.preventDefault()
        e.stopPropagation()
      },
      Escape: (e: KeyboardEvent) => {
        this.showPalette = false
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // create and add the event listener
    this.handler = createKeybindingsHandler(bindings)
    document.addEventListener('keydown', this.handler)
  }

  /**
   * Remove event listener
   *
   * @return {void}
   */
  removePaletteEvent(): void {
    // skipcq: JS-0387
    document.removeEventListener('keydown', this.handler)
  }

  get allowPalette(): boolean {
    return Boolean(this.loggedIn && this.viewer.isBetaTester)
  }
}
