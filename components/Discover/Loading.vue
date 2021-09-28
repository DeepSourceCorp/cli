<template>
  <div>
    <div class="grid pb-8 place-content-center">
      <z-icon icon="spin-loader" class="animate-spin" color="juniper" size="large" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon
  }
})
export default class Loading extends Vue {}
</script>
