<template>
  <base-state title="Test artifacts were not uploaded in time">
    <template slot="hero">
      <empty-state-picture
        :webp-image-path="require('~/assets/images/ui-states/timeout/timeout-state-136px.webp')"
        :png-image-path="require('~/assets/images/ui-states/timeout/timeout-state-136px.gif')"
        width="w-26"
        class="mx-auto"
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
