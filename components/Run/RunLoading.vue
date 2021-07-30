<template>
  <base-state title="Waiting for results">
    <template slot="hero">
      <div class="grid place-content-center pb-8">
        <z-icon icon="spin-loader" class="animate-spin" color="juniper" size="large"></z-icon>
      </div>
    </template>
    <p>We're currently analyzing the branch, it usually takes a few minutes to fetch the results</p>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { BaseState } from '@/components/RepoStates'

@Component({ components: { ZIcon, BaseState } })
export default class RunLoading extends Vue {}
</script>
