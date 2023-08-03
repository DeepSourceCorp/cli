<template>
  <div class="container mx-auto">
    <div
      class="flex min-h-screen flex-col justify-between pb-24 pt-32 text-center text-sm text-vanilla-400"
    >
      <div class="flex flex-grow items-center">
        <empty-state
          :png-image-path="require('~/assets/images/ui-states/autofix/autofix-installed.png')"
          :webp-image-path="require('~/assets/images/ui-states/autofix/autofix-installed.webp')"
          class="space-y-8"
        >
          <template #title>
            <span class="text-base">Successfully installed Autofix<sup>TM</sup> </span></template
          >
          <template #subtitle>
            You can now automatically fix code quality and security issues in a couple of clicks, or
            format code automatically with Transformers.
          </template>
        </empty-state>
      </div>
      <div class="space-y-2">
        <p>You can close this window if it does not automatically close.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({})
export default class AutofixInstallation extends Vue {
  mounted() {
    setTimeout(() => {
      window.close()
    }, 2000)
  }
}
</script>
