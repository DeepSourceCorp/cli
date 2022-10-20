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
