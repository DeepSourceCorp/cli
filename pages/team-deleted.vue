<template>
  <deleted-account-state />
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

/**
 * Page to be shown to a user after team deletion. Redirects to the dashboard after 5 seconds.
 */
@Component({})
export default class TeamDeleted extends Vue {
  /**
   * Mounted hook
   * Redirect to the dashboard
   *
   * @returns {void}
   */
  mounted(): void {
    setTimeout(() => {
      this.$router.push('/dashboard')
    }, 5000)
  }
}
</script>
