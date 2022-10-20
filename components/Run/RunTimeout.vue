<template>
  <base-state title="This run couldn’t finish in time">
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
 * ? Timeout empty state for Analyzer runs.
 */
@Component({ components: { BaseState } })
export default class RunTimeout extends Vue {}
</script>
