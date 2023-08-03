<template>
  <nuxt-link
    :to="settingsLink"
    class="rounded-sm bg-vanilla-100 bg-opacity-10 px-1 text-cherry-150"
    >{{ login }}</nuxt-link
  >
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * A clickable label for a team. Links to the members settings page.
 */
@Component({})
export default class TeamLabel extends Vue {
  @Prop()
  login: string

  @Prop()
  vcsProvider: string

  get settingsLink() {
    return `/${this.vcsProvider.toLowerCase()}/${this.login}/members/active`
  }
}
</script>
