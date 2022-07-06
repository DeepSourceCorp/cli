<template>
  <base-state title="Waiting for results">
    <template slot="hero">
      <div class="grid place-content-center pb-8">
        <z-icon icon="spin-loader" class="animate-spin" color="juniper" size="large"></z-icon>
      </div>
    </template>
    <p>We're waiting for the test coverage artifact to be reported</p>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { BaseState } from '@/components/RepoStates'

/**
 * ? Waiting empty state for Test Analyzer runs.
 */
@Component({ components: { ZIcon, BaseState } })
export default class RunWaiting extends Vue {}
</script>
