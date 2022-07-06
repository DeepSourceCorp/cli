<template>
  <base-state title="Metrics are failing" subtitle="Check is passing but some metrics are failing.">
    <template slot="hero">
      <img
        class="mx-auto mb-4"
        :src="require('~/assets/images/ui-states/repo/error.svg')"
        alt="Run cancelled"
      />
    </template>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

/**
 * ? Cancelled empty state for Analyzer runs.
 */
@Component({ components: { BaseState } })
export default class RunCancelled extends Vue {}
</script>
