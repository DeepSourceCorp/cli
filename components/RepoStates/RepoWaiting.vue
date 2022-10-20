<template>
  <base-state title="Waiting for results">
    <template slot="hero">
      <video
        :poster="require('~/assets/images/ui-states/autofix/loader-animation-108px.png')"
        autoplay
        loop
        disablepictureinpicture
        muted
        class="mx-auto w-26"
      >
        <source
          :src="require('~/assets/images/ui-states/autofix/loader-animation-108px.webm')"
          type="video/webm"
        />
      </video>
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
