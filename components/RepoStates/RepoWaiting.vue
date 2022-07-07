<template>
  <base-state>
    <template slot="hero">
      <div class="grid pb-8 place-content-center">
        <z-icon icon="spin-loader" class="animate-spin" color="juniper" size="large"></z-icon>
      </div>
    </template>
    <template slot="title">
      <h1 class="text-base font-bold text-center text-vanilla-100">{{ title }}</h1>
    </template>
    <p class="max-w-lg">
      This is the first analysis for this repository. We're analyzing all the files, so it can take
      a while.
    </p>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import { BaseState } from '.'
import { ZIcon } from '@deepsourcelabs/zeal'

@Component({
  components: {
    BaseState,
    ZIcon
  }
})
export default class RepoWaiting extends Vue {}
</script>
