import ZModal from './ZModal.vue'
import ZButton from '../ZButton/ZButton.vue'

import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import Vue from 'vue'

export default {
  title: 'Modal',
  component: ZModal
}

export const Default = () =>
  Vue.extend({
    components: { ZModal, ZButton },
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
        <z-modal
          v-if="isOpen"
          title="Save Config"
          body="Are you sure you want to save this config?"
          primaryActionLabel="Confirm"
          @onClose="close"
          @primaryAction="confirm"
        ></z-modal>
    </div>`
  })

export const ModalSizes = () =>
  Vue.extend({
    components: { ZModal, ZButton },
    data() {
      return {
        isOpen: false,
        width: 'base'
      }
    },
    methods: {
      open(width: string) {
        this.width = width
        this.isOpen = true
      },
      close() {
        this.isOpen = false
      },
      confirm() {
        window.alert('Configuration Save')
      }
    },
    template: `<div class='wrapper'>
        <div class="flex space-x-4">
          <z-button color="primary" @click="open('narrow')">Narrow Modal</z-button>
          <z-button color="primary" @click="open('base')">Default/Base Modal</z-button>
          <z-button color="primary" @click="open('wide')">Wide Modal</z-button>
        </div>
        <z-modal
          v-if="isOpen"
          title="Save config"
          body="Are you sure you want to save this config?"
          primaryActionLabel="Confirm"
          :width="width"
          @onClose="close"
          @primaryAction="confirm"
        ></z-modal>
    </div>`
  })

export const PrimaryActionColor = () =>
  Vue.extend({
    components: { ZModal, ZButton },
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
        window.alert('Account Deleted')
      }
    },
    template: `<div class='wrapper'>
        <z-button color="danger" @click="() => { this.isOpen = !this.isOpen }">Delete Account</z-button>
        <z-modal
          v-if="isOpen"
          title="Are you sure you want to delete your account?"
          primaryActionLabel="Confirm Delete"
          primaryActionType="danger"
          @onClose="close"
          @primaryAction="confirm"
        >
          <div class="px-3 py-2 text-vanilla-100 text-sm">
            Deleting your account will stop DeepSource analysis on all your repositories.
            Your analysis history and metrics will also be removed permanentally from the system
          </div>
        </z-modal>
    </div>`
  })
