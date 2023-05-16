<template>
  <!-- TODO the sidebar shouldn't need a z-index in lg+ screens but conflicts with zeal components block this  -->
  <div
    class="transition-width fixed top-0 z-50 h-screen w-80 duration-200 lg:sticky lg:left-0 lg:w-72"
    :class="isOpen ? 'left-0' : '-left-full'"
  >
    <sidebar-menu
      width="lg:w-full"
      :collapsible="false"
      footer-class="bg-ink-300 px-4"
      footer-brand-class="bg-ink-300 px-4"
      @open="openModal()"
      @close="closeModal()"
    >
      <template #header>
        <section class="border-b border-slate-400 p-4">
          <img
            src="~/assets/images/logo-wordmark-white.svg"
            alt="DeepSource"
            class="mt-0.5 mb-px h-5 w-auto"
          />
        </section>
      </template>
      <template #default>
        <div class="grid gap-2 text-sm">
          <nuxt-link to="/me" class="flex items-center rounded-md px-2 py-1 hover:bg-ink-200"
            ><z-icon icon="dashboard" color="vanilla-300" class="mr-2.5" />
            <span>Dashboard</span></nuxt-link
          >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.deepsource.com/docs"
            class="flex items-center rounded-md px-2 py-1 hover:bg-ink-200"
          >
            <z-icon icon="resources" color="vanilla-300" class="mr-2.5" />
            <span>Resources</span>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="/pricing"
            class="flex items-center rounded-md px-2 py-1 hover:bg-ink-200"
          >
            <z-icon icon="pricing" color="vanilla-300" class="mr-2.5" />
            <span>Pricing</span>
          </a>
          <nuxt-link
            v-if="!$config.onPrem"
            to="/discover"
            class="flex items-center rounded-md px-2 py-1 hover:bg-ink-200"
            ><z-icon icon="discover" color="vanilla-300" class="mr-2.5" />
            <span>Discover</span></nuxt-link
          >
          <nuxt-link to="/directory" class="flex items-center rounded-md px-2 py-1 hover:bg-ink-200"
            ><z-icon icon="book" color="vanilla-300" class="mr-2.5" />
            <span>Directory</span></nuxt-link
          >
          <nuxt-link
            to="/login"
            class="flex items-center rounded-md px-2 py-1 text-juniper hover:bg-ink-200"
            ><z-icon icon="log-in" color="juniper" class="mr-2.5" /> <span>Log in</span></nuxt-link
          >
        </div>
      </template>
      <template #footer>
        <h3 class="text-lg font-semibold">Run your first analysis.</h3>
        <p class="mt-2 text-sm text-vanilla-400">
          Find thousands of code security and quality issues in your codebase, before they end up in
          production.
        </p>
        <z-button to="/signup" button-type="primary" class="mt-4 w-full">Start now</z-button>
      </template>
      <template #brand>
        <div class="flex justify-center space-x-3">
          <z-button
            to="https://twitter.com/DeepSourceHQ"
            size="small"
            button-type="secondary"
            icon="twitter-solid"
          />
          <z-button
            to="https://www.instagram.com/deepsourcehq/"
            size="small"
            button-type="secondary"
            icon="instagram-solid"
          />
          <z-button
            to="https://linkedin.com/company/deepsourcelabs"
            size="small"
            button-type="secondary"
            icon="linkedin-solid"
          />
          <z-button
            to="https://www.youtube.com/channel/UCzSjS7r8wY7rgDn79dFd1MA"
            size="small"
            button-type="secondary"
            icon="youtube-solid"
          />
        </div>
      </template>
    </sidebar-menu>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsource/zeal'

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
