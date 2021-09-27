<template>
  <div
    class="absolute h-screen duration-200 transition-width lg:relative w-80 lg:w-72 lg:left-0"
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
        <div class="-mx-2">
          <div class="px-4 py-5">
            <img class="h-4" src="~/assets/images/logo-wordmark-white.svg" alt="DeepSource" />
          </div>
          <hr class="border-ink-200" />
        </div>
      </template>
      <template slot="default">
        <div class="grid gap-2 text-sm">
          <nuxt-link to="/me" class="px-2 py-1 rounded-md hover:bg-ink-200 flex items-center"
            ><z-icon icon="dashboard" color="vanilla-300" class="mr-2.5" />
            <span>Dashboard</span></nuxt-link
          >
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://deepsource.io/docs/"
            class="px-2 py-1 rounded-md hover:bg-ink-200 flex items-center"
          >
            <z-icon icon="resources" color="vanilla-300" class="mr-2.5" />
            <span>Resources</span>
          </a>
          <!-- TODO Enable when enterprise page from marketing is live  -->
          <!-- <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://deepsource.io/docs/"
            class="px-2 py-1 rounded-md hover:bg-ink-200 flex items-center"
          >
            <z-icon icon="enterprise" color="vanilla-300" class="mr-2.5" />
            <span>Enterprise</span>
          </a> -->
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="/pricing"
            class="px-2 py-1 rounded-md hover:bg-ink-200 flex items-center"
          >
            <z-icon icon="pricing" color="vanilla-300" class="mr-2.5" />
            <span>Pricing</span>
          </a>
          <nuxt-link to="/discover" class="px-2 py-1 rounded-md hover:bg-ink-200 flex items-center"
            ><z-icon icon="discover" color="vanilla-300" class="mr-2.5" />
            <span>Discover</span></nuxt-link
          >
          <nuxt-link to="/directory" class="px-2 py-1 rounded-md hover:bg-ink-200 flex items-center"
            ><z-icon icon="book" color="vanilla-300" class="mr-2.5" />
            <span>Directory</span></nuxt-link
          >
          <nuxt-link
            to="/login"
            class="px-2 py-1 rounded-md hover:bg-ink-200 text-juniper flex items-center"
            ><z-icon icon="log-in" color="juniper" class="mr-2.5" /> <span>Log in</span></nuxt-link
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
import { Vue, Component } from 'nuxt-property-decorator'
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
