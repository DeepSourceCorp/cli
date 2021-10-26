import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class PortalMixin extends Vue {
  modalToggled(newHasContent: boolean): void {
    if (newHasContent && process.client) {
      document.body.classList.add('no-scroll')
    } else if (process.client) {
      document.body.classList.remove('no-scroll')
    }
  }
}
