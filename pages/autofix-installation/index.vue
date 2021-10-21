<template>
  <div class="container mx-auto">
    <div
      class="
        text-vanilla-400 text-sm text-center
        flex flex-col
        justify-between
        min-h-screen
        pb-24
        pt-32
      "
    >
      <div class="space-y-2">
        <video class="max-w-xl mx-auto" poster="/installation-loader.png" autoplay>
          <source src="/loading.mp4" type="video/mp4" />
        </video>
        <h1 class="text-2xl text-vanilla-100 font-semibold">Successfully installed Autofix</h1>
        <p class="max-w-lg mx-auto">
          You can now fix code quality issues with just a click, the Autofix app also allows you to
          run standard transformers on your projects.
        </p>
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
