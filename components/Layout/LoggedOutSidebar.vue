<template>
  <!-- TODO the sidebar shouldn't need a z-index in lg+ screens but conflicts with zeal components block this  -->
  <div
    class="fixed top-0 z-50 h-screen duration-200 lg:sticky lg:left-0 transition-width w-80 lg:w-72"
    :class="isOpen ? 'left-0' : '-left-full'"
  >
    <sidebar-menu
      width="lg:w-full"
      @open="openModal()"
      @close="closeModal()"
      :collapsible="false"
      footerClass="bg-ink-300 px-4"
      footerBrandClass="bg-ink-300 px-4"
    >
      <template slot="header">
        <section class="p-4 border-b border-ink-200">
          <img
            src="~/assets/images/logo-wordmark-white.svg"
            alt="DeepSource"
            class="w-auto h-5 mt-0.5 mb-px"
          />
        </section>
      </template>
      <template slot="default">
        <div class="grid gap-2 text-sm">
          <nuxt-link to="/me" class="flex items-center px-2 py-1 rounded-md hover:bg-ink-200"
            ><z-icon icon="dashboard" color="vanilla-300" class="mr-2.5" />
            <span>Dashboard</span></nuxt-link
          >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://deepsource.io/docs/"
            class="flex items-center px-2 py-1 rounded-md hover:bg-ink-200"
          >
            <z-icon icon="resources" color="vanilla-300" class="mr-2.5" />
            <span>Resources</span>
          </a>
          <!-- TODO Enable when enterprise page from marketing is live  -->
          <!-- <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://deepsource.io/docs/"
            class="flex items-center px-2 py-1 rounded-md hover:bg-ink-200"
          >
            <z-icon icon="enterprise" color="vanilla-300" class="mr-2.5" />
            <span>Enterprise</span>
          </a> -->
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="/pricing"
            class="flex items-center px-2 py-1 rounded-md hover:bg-ink-200"
          >
            <z-icon icon="pricing" color="vanilla-300" class="mr-2.5" />
            <span>Pricing</span>
          </a>
          <nuxt-link
            v-if="!$config.onPrem"
            to="/discover"
            class="flex items-center px-2 py-1 rounded-md hover:bg-ink-200"
            ><z-icon icon="discover" color="vanilla-300" class="mr-2.5" />
            <span>Discover</span></nuxt-link
          >
          <nuxt-link to="/directory" class="flex items-center px-2 py-1 rounded-md hover:bg-ink-200"
            ><z-icon icon="book" color="vanilla-300" class="mr-2.5" />
            <span>Directory</span></nuxt-link
          >
          <nuxt-link
            to="/login"
            class="flex items-center px-2 py-1 rounded-md hover:bg-ink-200 text-juniper"
            ><z-icon icon="log-in" color="juniper" class="mr-2.5" /> <span>Log in</span></nuxt-link
          >
        </div>
      </template>
      <template slot="footer">
        <h3 class="text-lg font-semibold">Run your first analysis.</h3>
        <p class="mt-2 text-sm text-vanilla-400">
          Find thousands of code security and quality issues in your codebase, before they end up in
          production.
        </p>
        <z-button to="/signup" buttonType="primary" class="w-full mt-4">Start now</z-button>
      </template>
      <template slot="brand">
        <div class="flex justify-center space-x-3">
          <z-button
            to="https://twitter.com/DeepSourceHQ"
            size="small"
            buttonType="secondary"
            icon="twitter-solid"
          />
          <z-button
            to="https://www.instagram.com/deepsourcehq/"
            size="small"
            buttonType="secondary"
            icon="instagram-solid"
          />
          <z-button
            to="https://linkedin.com/company/deepsourcelabs"
            size="small"
            buttonType="secondary"
            icon="linkedin-solid"
          />
          <z-button
            to="https://www.youtube.com/channel/UCzSjS7r8wY7rgDn79dFd1MA"
            size="small"
            buttonType="secondary"
            icon="youtube-solid"
          />
        </div>
      </template>
    </sidebar-menu>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon,
    ZButton
  }
})
export default class LoggedOutSidebar extends Vue {
  public isOpen = false

  openModal(): void {
    this.isOpen = true
  }

  closeModal(): void {
    this.isOpen = false
  }

  @Watch('isOpen')
  disableScroll(newIsOpen: boolean) {
    if (newIsOpen && process.client) {
      document.body.classList.add('no-scroll')
    } else if (process.client) {
      document.body.classList.remove('no-scroll')
    }
  }
}
</script>
