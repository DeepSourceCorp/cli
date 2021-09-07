<template>
  <div class="bg-ink-400 text-vanilla-100 min-h-screen flex items-center justify-center">
    <section
      v-if="$config.onPrem && error.statusCode === 403 && error.message === 'license-expired'"
      class="text-center space-y-8 max-w-xl"
    >
      <img
        class="mx-auto mb-8 w-56 max-w-xs"
        :src="require('~/assets/images/ui-states/app/license-expired.png')"
        alt="Repo Inactive"
      />
      <div class="space-y-4">
        <h3 class="text-center text-vanilla-100 font-semibold text-lg">
          Your DeepSource license has expired.
        </h3>
        <p class="text-vanilla-400 text-sm">
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
    <div v-else class="text-center space-y-5 max-w-xl">
      <h1 class="text-7xl font-black text-center">{{ error.statusCode }}</h1>
      <p class="text-center text-vanilla-100 font-semibold text-lg">{{ error.message }}</p>
      <p v-if="error.statusCode === 404" class="text-vanilla-400">
        Just like the theory that says '404' was named after a
        room at CERN where the first web servers were located.
      </p>
      <div class="flex items-center justify-center space-x-3">
        <NuxtLink class="text-center text-juniper text-sm hover:underline" to="/"
          >Home page</NuxtLink
        >
        <NuxtLink class="text-center text-juniper text-sm hover:underline" to="/login"
          >Login</NuxtLink
        >
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
}
</script>
