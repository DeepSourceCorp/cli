<template>
  <base-state title="Test artifacts were not uploaded in time">
    <template slot="hero">
      <img
        class="mx-auto mb-4"
        :src="require('~/assets/images/ui-states/repo/empty.svg')"
        alt="Run failed"
      />
    </template>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

/**
 * ? Nuked empty state for Analyzer runs.
 * ? Indicates that run was awaiting artifacts which were never received and was forcefully timed out.
 */
@Component({ components: { BaseState } })
export default class RunNuked extends Vue {}
</script>
