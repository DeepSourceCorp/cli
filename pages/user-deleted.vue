<template>
  <div class="w-full flex relative">
    <div class="absolute w-1/2 -top-102 inset-x-1/4 rounded-full gradient-layer"></div>
    <div
      class="flex flex-col mx-auto justify-between min-h-screen pt-32 pb-24 text-sm text-center text-vanilla-400"
    >
      <div class="flex items-center flex-grow">
        <empty-state
          :png-image-path="require('~/assets/images/ui-states/user-deleted.gif')"
          :webp-image-path="require('~/assets/images/ui-states/user-deleted.webp')"
          class="space-y-8"
        >
          <template #title> <span class="text-base">Your account has been deleted.</span></template>
          <template #subtitle> Redirecting to deepsource.io... </template>
        </empty-state>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, mixins } from 'nuxt-property-decorator'
import AuthMixin from '~/mixins/authMixin'

/**
 * Page to be shown to a user after account deletion. Redirects to the DeepSource homepage after 5 seconds.
 */
@Component({})
export default class UserDeleted extends mixins(AuthMixin) {
  /**
   * Mounted hook
   * Clear user data and redirect to the homepage
   *
   * @returns {Promise<void>}
   */
  async mounted(): Promise<void> {
    this.purgeClientData()

    setTimeout(() => {
      window.location.replace('https://deepsource.io')
    }, 5000)
  }
}
</script>

<style scoped>
.gradient-layer {
  background: linear-gradient(
    180deg,
    rgba(220, 69, 69, 0.6) 64.4%,
    rgba(236, 123, 59, 0.6) 76.78%,
    rgba(253, 209, 97, 0) 100%
  );
  opacity: 0.12;
  box-shadow: 0px 10.5635px 660.221px 5281.77px rgba(0, 0, 0, 0.25);
  filter: blur(158.453px);
  height: 956px;
}
</style>
