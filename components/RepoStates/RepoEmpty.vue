<template>
  <base-state title="No code found in the repository">
    <template slot="hero">
      <img
        class="mx-auto mb-4"
        :src="require('~/assets/images/ui-states/repo/empty.svg')"
        alt="Repo Empty"
      />
    </template>
    This repository seems to be empty. Please add code and check back later.
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '.'

@Component({
  components: {
    BaseState
  }
})
export default class RepoEmpty extends Vue {}
</script>
