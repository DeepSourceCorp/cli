<template>
  <main>
    <four-o-four v-if="error.statusCode === 404" />
    <five-hundred v-else-if="[500, 501, 502, 503, 504].includes(error.statusCode)" />
    <div v-else class="flex min-h-screen items-center justify-center bg-ink-400 text-vanilla-100">
      <section
        v-if="$config.onPrem && error.statusCode === 403 && error.message === 'license-expired'"
        class="max-w-xl space-y-8 text-center"
      >
        <img
          class="mx-auto mb-8 w-56 max-w-xs"
          :src="require('~/assets/images/ui-states/app/license-expired.png')"
          alt="Repo Inactive"
        />
        <div class="space-y-4">
          <h3 class="text-center text-lg font-semibold text-vanilla-100">
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
      <section v-else-if="$config.onPrem && areSeatsFull" class="max-w-xl space-y-8 text-center">
        <img
          class="mx-auto mb-8 w-56 max-w-xs"
          :src="require('~/assets/images/ui-states/app/license-expired.png')"
          alt="Repo Inactive"
        />
        <div class="space-y-4">
          <h3 class="text-center text-lg font-semibold text-vanilla-100">
            You have exhausted all seats in your DeepSource license.
          </h3>
          <p class="text-sm text-vanilla-400">
            Please contact your administrator for upgrading the license.
          </p>
        </div>
        <div class="flex items-center justify-center space-x-3">
          <z-button size="small" :to="`mailto:${$config.supportEmail}`" icon="support">
            Contact support
          </z-button>
        </div>
      </section>
      <div v-else class="max-w-xl space-y-5 text-center">
        <h1 class="text-center text-7xl font-black">{{ error.statusCode }}</h1>
        <p class="text-center text-lg font-semibold text-vanilla-100">{{ error.message }}</p>
        <div class="flex items-center justify-center space-x-3">
          <a href="/" class="text-center text-sm text-juniper hover:underline"> Home page </a>
          <a class="text-center text-sm text-juniper hover:underline" :href="loginUrl">Login</a>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { NuxtError } from '@nuxt/types'
import { formatDate } from '~/utils/date'

@Component({
  methods: {
    formatDate
  }
})
export default class ErrorLayout extends Vue {
  @Prop({ required: true })
  error: NuxtError

  get loginUrl(): string {
    return `/login?next=${this.$route.fullPath}`
  }

  get areSeatsFull(): boolean {
    if (this.error.message)
      return this.error.message.indexOf('You have exhausted all the seats') > 0
    return false
  }
}
</script>
