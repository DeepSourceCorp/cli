<template>
  <base-state title="Waiting for results">
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
    <p class="max-w-md">
      We're currently analyzing the branch, it usually takes a few minutes to fetch the results.
    </p>
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { BaseState } from '@/components/RepoStates'

@Component({ components: { BaseState } })
export default class RunLoading extends Vue {}
</script>
