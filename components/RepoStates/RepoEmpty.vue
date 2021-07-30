<template>
  <base-state title="No code found in the repository">
    <template slot="hero">
      <div class="text-4xl text-center mb-4">📭</div>
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
