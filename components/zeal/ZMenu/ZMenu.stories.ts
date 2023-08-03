import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'

import ZDivider from '../ZDivider/ZDivider.vue'
import ZAvatar from '../ZAvatar/ZAvatar.vue'

import ZMenu from '.'
import ZMenuItem from './ZMenuItem'
import ZMenuSection from './ZMenuSection'
import ZButton from '../ZButton/ZButton.vue'

export default {
  title: 'Menu',
  component: ZMenu,
  excludeStories: /.*Data$/
}

export const DefaultMenu = () => ({
  components: { ZMenu, ZMenuItem, ZMenuSection, ZDivider },
  template: `
    <div class="container">
        <z-menu>
          <template slot="body">
            <z-menu-section title="Logged In As">
              <z-menu-item>evan@deepsource.io</z-menu-item>
            </z-menu-section>
            <z-menu-section title="Actions">
              <z-menu-item :action="goToSettings">Account Settings</z-menu-item>
              <z-menu-item :action="goToSettings" :disabled="true">Autofix (Coming Soon)</z-menu-item>
              <z-menu-item :action="goToSettings">Contact Support</z-menu-item>
              <z-menu-item :action="goToSettings">Give Feedback</z-menu-item>
            </z-menu-section>
            <z-menu-section :divider="false">
              <z-menu-item :action="goToSettings">Switch User</z-menu-item>
              <z-menu-item :action="goToSettings">Sign out</z-menu-item>
            </z-menu-section>
          </template>
        </z-menu>
    </div>`,
  methods: {
    goToSettings() {
      alert('Action Triggered')
    }
  }
})

export const MenuWithHoverTrigger = () => ({
  components: { ZMenu, ZMenuItem, ZMenuSection, ZDivider },
  template: `
    <div class="container">
        <z-menu :triggerOnHover="true">
          <template slot="body">
            <z-menu-section title="Logged In As">
              <z-menu-item>evan@deepsource.io</z-menu-item>
            </z-menu-section>
            <z-menu-section title="Actions">
              <z-menu-item :action="goToSettings">Account Settings</z-menu-item>
              <z-menu-item :action="goToSettings" :disabled="true">Autofix (Coming Soon)</z-menu-item>
              <z-menu-item :action="goToSettings">Contact Support</z-menu-item>
              <z-menu-item :action="goToSettings">Give Feedback</z-menu-item>
            </z-menu-section>
            <z-menu-section :divider="false">
              <z-menu-item :action="goToSettings">Switch User</z-menu-item>
              <z-menu-item :action="goToSettings">Sign out</z-menu-item>
            </z-menu-section>
          </template>
        </z-menu>
    </div>`,
  methods: {
    goToSettings() {
      alert('Action Triggered')
    }
  }
})

export const MultipleSizes = () => ({
  components: { ZMenu, ZMenuItem, ZMenuSection, ZDivider, ZButton },
  template: `
    <div class="container flex align-top gap-5">
        <z-menu size="large">
          <template v-slot:trigger="{ toggle }">
            <z-button @click="toggle">Menu 1</z-button>
          </template>
          <template slot="body">
            <z-menu-item :action="goToSettings">Account Settings</z-menu-item>
            <z-menu-item :action="goToSettings">Contact Support</z-menu-item>
            <z-menu-item :action="goToSettings">Give Feedback</z-menu-item>
          </template>
        </z-menu>
        <z-menu size="base">
          <template v-slot:trigger="{ toggle }">
            <z-button size="small" @click="toggle">Menu 2</z-button>
          </template>
          <template slot="body">
            <z-menu-item :action="goToSettings">Account Settings</z-menu-item>
            <z-menu-item :action="goToSettings">Contact Support</z-menu-item>
            <z-menu-item :action="goToSettings">Give Feedback</z-menu-item>
          </template>
        </z-menu>
        <z-menu size="small">
          <template v-slot:trigger="{ toggle }">
            <z-button size="x-small" @click="toggle">Menu 3</z-button>
          </template>
          <template slot="body">
            <z-menu-item :action="goToSettings">Account Settings</z-menu-item>
            <z-menu-item :action="goToSettings">Contact Support</z-menu-item>
            <z-menu-item :action="goToSettings">Give Feedback</z-menu-item>
          </template>
        </z-menu>
    </div>`,
  methods: {
    goToSettings() {
      alert('Action Triggered')
    }
  }
})

export const MenuWithIcons = () => ({
  components: { ZMenu, ZMenuItem, ZMenuSection, ZDivider },
  template: `
    <div class="container">
        <z-menu>
          <template slot="body">
            <z-menu-section title="Logged In As">
              <z-menu-item>evan@deepsource.io</z-menu-item>
            </z-menu-section>
            <z-menu-section title="Actions">
              <z-menu-item :action="goToSettings" icon="settings" icon-color="juniper">Account Settings</z-menu-item>
              <z-menu-item :action="goToSettings" :disabled="true" icon="cpu" icon-color="juniper">Autofix (Coming Soon)</z-menu-item>
              <z-menu-item :action="goToSettings" icon="headphones" icon-color="juniper">Contact Support</z-menu-item>
              <z-menu-item :action="goToSettings" icon="message-square" icon-color="juniper">Give Feedback</z-menu-item>
            </z-menu-section>
            <z-menu-section :divider="false">
              <z-menu-item :action="goToSettings" icon="users">Switch User</z-menu-item>
              <z-menu-item :action="goToSettings" icon="log-out">Sign out</z-menu-item>
            </z-menu-section>
          </template>
        </z-menu>
    </div>`,
  methods: {
    goToSettings() {
      alert('Action Triggered')
    }
  }
})

const menuBody = (label: string) => `<template v-slot:trigger="{ toggle }">
<z-button size="small" @click="toggle">${label}</z-button>
</template>
<template slot="body">
<z-menu-section title="Logged In As">
  <z-menu-item>evan@deepsource.io</z-menu-item>
</z-menu-section>
<z-menu-section :divider="false">
  <z-menu-item :action="goToSettings">Switch User</z-menu-item>
  <z-menu-item :action="goToSettings">Sign out</z-menu-item>
</z-menu-section>
</template>`

export const MenuWithDirection = () => ({
  components: { ZMenu, ZMenuItem, ZMenuSection, ZDivider, ZButton },
  template: `
    <div class="container flex items-center space-x-5 mx-auto my-32">
      <z-menu direction="left" placement="top">
        ${menuBody('Top Left')}
      </z-menu>
      <z-menu placement="top">
        ${menuBody('Top Right')}
      </z-menu>
      <z-menu direction="left">
        ${menuBody('Bottom Left')}
      </z-menu>
      <z-menu>
        ${menuBody('Bottom Right')}
      </z-menu>
    </div>`,
  methods: {
    goToSettings() {
      alert('Action Triggered')
    }
  }
})

export const MenuWithAvatarTrigger = () => ({
  components: { ZMenu, ZMenuItem, ZMenuSection, ZDivider, ZAvatar },
  template: `
    <div class="container">
        <z-menu body-spacing="py-0.5">
          <template v-slot:trigger="{ toggle }">
          <button @click="toggle">
            <z-avatar
              type="span"
              image="https://randomuser.me/api/portraits/women/24.jpg"
              user-name="Akshay Paliwal"
              href="https://example.com"
            ></z-avatar>
          </button>
          </template>
          <template slot="body">
            <z-menu-section title="Logged In As">
              <z-menu-item>evan@deepsource.io</z-menu-item>
            </z-menu-section>
            <z-menu-section :divider="false">
              <z-menu-item :action="goToSettings">Preferences</z-menu-item>
              <z-menu-item :action="goToSettings">Sign out</z-menu-item>
            </z-menu-section>
          </template>
        </z-menu>
    </div>`,
  methods: {
    goToSettings() {
      alert('Action Triggered')
    }
  }
})

export const MenuWithComplexItems = () => ({
  components: { ZMenu, ZMenuItem, ZMenuSection, ZDivider, ZAvatar },
  template: `
    <div class="container">
        <z-menu trigger-label="Switch user">
          <template slot="body">
            <z-menu-section title="Switch User">
              <z-menu-item :action="goToSettings">
                <z-avatar
                  type="span"
                  image="https://randomuser.me/api/portraits/women/24.jpg"
                  user-name="Akshay Paliwal"
                  href="https://example.com"
                ></z-avatar>
                <div class="flex-col">
                  Simona Dsouza
                  <p class="text-vanilla-400 mt-1">simona@deepsource.io</p> 
                </div>
              </z-menu-item>
              <z-menu-item :action="goToSettings">
                <z-avatar
                  type="span"
                  image="https://randomuser.me/api/portraits/men/24.jpg"
                  user-name="Akshay Paliwal"
                  href="https://example.com"
                ></z-avatar>
                <div class="flex-col">
                  Alex Garcia
                  <p class="text-vanilla-400 mt-1">alex@deepsource.io</p> 
                </div>
              </z-menu-item>
            </z-menu-section>
            <z-menu-section :divider="false">
              <z-menu-item icon="plus" :action="goToSettings">Add an Account</z-menu-item>
            </z-menu-section>
          </template>
        </z-menu>
    </div>`,
  methods: {
    goToSettings() {
      alert('Action Triggered')
    }
  }
})
