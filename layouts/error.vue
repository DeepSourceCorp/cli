<template>
  <div class="flex items-center justify-center min-h-screen bg-ink-400 text-vanilla-100">
    <section
      v-if="$config.onPrem && error.statusCode === 403 && error.message === 'license-expired'"
      class="max-w-xl space-y-8 text-center"
    >
      <img
        class="w-56 max-w-xs mx-auto mb-8"
        :src="require('~/assets/images/ui-states/app/license-expired.png')"
        alt="Repo Inactive"
      />
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-center text-vanilla-100">
          Your DeepSource license has expired.
        </h3>
        <p class="text-sm text-vanilla-400">
          The license for this installation has expired as of
          <b class="text-vanilla-100"> {{ formatDate($config.licenseExpiry) }}. </b>
          <br />Please contact your DeepSource installation administrator.
        </p>
      </div>
      <div class="flex items-center justify-center space-x-3">
        <z-button size="small" :to="`mailto:${$config.supportEmail}`" icon="support">
          Contact support
        </z-button>
      </div>
    </section>
    <div
      v-else-if="[500, 501, 502, 503, 504].includes(error.statusCode)"
      class="max-w-xl space-y-5 text-center"
    >
      <!-- 
        500 Internal Server Error
        501 Not Implemented
        502 Bad Gateway
        503 Service Unavailable
        504 Gateway Timeout 
      -->
      <h1 class="font-black text-center text-7xl">{{ error.statusCode }}</h1>
      <div class="space-y-2">
        <p class="text-lg font-semibold text-center text-vanilla-100">
          There was an error while accessing DeepSource.
        </p>
        <p class="max-w-md mx-auto text-sm text-vanilla-200">
          Our engineers are working to fix this, if this issue persists, please contact DeepSource
          support. We regret any inconvenience caused.
        </p>
      </div>
      <div class="flex items-center justify-center space-x-3">
        <a
          v-if="!$config.onPrem"
          href="https://deepsourcestatus.com/"
          target="blank"
          rel="noreferrer noopener"
          class="text-sm text-center text-juniper hover:underline"
        >
          Status page
        </a>
        <a
          v-if="$config.supportEmail"
          class="text-sm text-center text-juniper hover:underline"
          :href="`mailto:${$config.supportEmail}`"
        >
          Contact support
        </a>
      </div>
    </div>
    <div v-else class="max-w-xl space-y-5 text-center">
      <h1 class="font-black text-center text-7xl">{{ error.statusCode }}</h1>
      <p class="text-lg font-semibold text-center text-vanilla-100">{{ error.message }}</p>
      <p v-if="error.statusCode === 404" class="text-vanilla-400">
        Just like the theory that says '404' was named after a room at CERN where the first web
        servers were located.
      </p>
      <div class="flex items-center justify-center space-x-3">
        <a href="/" class="text-sm text-center text-juniper hover:underline"> Home page </a>
        <a class="text-sm text-center text-juniper hover:underline" :href="loginUrl">Login</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { NuxtError } from '@nuxt/types'
import { ZButton } from '@deepsourcelabs/zeal'
import { formatDate } from '~/utils/date'

@Component({
  components: { ZButton }
})
export default class ErrorLayout extends Vue {
  @Prop({ required: true })
  error: NuxtError

  public formatDate = formatDate

  get loginUrl(): string {
    return `/login?next=${this.$route.fullPath}`
  }
}
</script>
