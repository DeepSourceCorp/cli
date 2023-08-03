import ZConfirm from './ZConfirm.vue'
import ZButton from '../ZButton/ZButton.vue'

import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import Vue from 'vue'

export default {
  title: 'Confirm',
  component: ZConfirm
}

export const Default = () =>
  Vue.extend({
    components: { ZConfirm, ZButton },
    data() {
      return {
        isOpen: false
      }
    },
    methods: {
      close() {
        this.isOpen = false
      },
      confirm() {
        window.alert('Configuration Save')
      }
    },
    template: `<div class='wrapper'>
        <z-button color="primary" @click="() => { this.isOpen = true }">Save Settings</z-button>
        <z-confirm
          v-if="isOpen"
          title="Are you sure you want to save this config?"
          subtitle="Nesciunt blanditiis aut corporis minus iste incidunt at amet. Eligendi voluptatem non tempora sed maiores quia tenetur vel. "
          primaryActionLabel="Confirm"
          @onClose="close"
          @primaryAction="confirm"
        ></z-confirm>
    </div>`
  })
