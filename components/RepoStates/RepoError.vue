<template>
  <base-state title="Analysis has been halted">
    <template slot="hero">
      <img
        class="mx-auto mb-4"
        :src="require('~/assets/images/ui-states/repo/error.svg')"
        alt="Repo Error"
      />
    </template>
    <p>
      We have been unable to analyze the code due to issues with analysis configuration. These
      issues must be resolved before we can continue.
    </p>
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
export default class RepoError extends Vue {}
</script>
