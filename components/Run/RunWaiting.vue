<template>
  <base-state title="Waiting to receive artifacts">
    <template #hero>
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
    <p>
      The analysis will begin as soon as we receive additional artifacts or reports required by the
      Analyzer.
    </p>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

/**
 * ? Waiting empty state for Test Analyzer runs.
 */
@Component({ components: { BaseState } })
export default class RunWaiting extends Vue {}
</script>
