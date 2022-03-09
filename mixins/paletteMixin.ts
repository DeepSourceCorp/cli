import { Component, mixins } from 'nuxt-property-decorator'
import { CommandAction } from '~/types/palette'
import ActiveUserMixin from './activeUserMixin'
import AuthMixin from './authMixin'

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
  public showPalette = false

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
    if (e.code === 'KeyK' && e.metaKey === true) {
      this.showPalette = !this.showPalette
      e.preventDefault()
      e.stopPropagation()
    }
  }

  /**
   * Set the palette event to enable command-k and slash shortcut
   * @return {void}
   */
  setPaletteEvent(): void {
    // skipcq: JS-0387
    document.addEventListener('keydown', this.togglePalette)
  }

  /**
   * Remove event listener
   *
   * @return {void}
   */
  removePaletteEvent(): void {
    // skipcq: JS-0387
    document.removeEventListener('keydown', this.togglePalette)
  }

  get allowPalette(): boolean {
    return Boolean(this.loggedIn && this.viewer.isBetaTester)
  }
}
