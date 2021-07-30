<template>
  <div
    class="absolute h-screen duration-200 transition-width lg:relative w-80 lg:left-0"
    :class="isOpen ? 'left-0' : '-left-full'"
  >
    <sidebar-menu
      width="full"
      @open="openModal()"
      @close="closeModal()"
      :collapsible="false"
      footerClass="bg-ink-300 px-4"
      footerBrandClass="bg-ink-300 px-4"
    >
      <template slot="header">
        <div class="p-2">
          <img class="h-4" src="~/assets/images/logo-wordmark-white.svg" alt="DeepSource" />
        </div>
      </template>
      <template slot="default">
        <div class="grid gap-2">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://deepsource.io/features"
            class="px-2 py-1 rounded-md hover:bg-ink-200"
            >Features</a
          >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://deepsource.io/docs/"
            class="px-2 py-1 rounded-md hover:bg-ink-200"
            >Documentation</a
          >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="/pricing"
            class="px-2 py-1 rounded-md hover:bg-ink-200"
            >Pricing</a
          >
          <nuxt-link to="/login" class="px-2 py-1 rounded-md hover:bg-ink-200 text-juniper"
            >Log in</nuxt-link
          >
        </div>
      </template>
      <template slot="footer">
        <h3 class="text-lg font-semibold">Code quality made simple.</h3>
        <p class="text-vanilla-400 text-sm mt-2">
          Avoid the grunt work of fixing issues. Save developer time. Maintain code quality.
        </p>
        <z-button to="/signup" buttonType="primary" class="mt-4 w-full">Get started</z-button>
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
}
</script>
