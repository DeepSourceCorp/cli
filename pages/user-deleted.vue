<template>
  <deleted-account-state account-type="account" />
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
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
   * @returns {void}
   */
  mounted(): void {
    this.purgeClientData()

    setTimeout(() => {
      window.location.replace('https://deepsource.io')
    }, 5000)
  }
}
</script>
