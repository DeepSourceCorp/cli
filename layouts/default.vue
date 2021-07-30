<template>
  <div class="bg-ink-400">
    <Nuxt />
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import FullStoryMixin from '~/mixins/fullStoryMixin'

@Component({
  components: {},
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2'
    }
  }
})
export default class DefaultLayout extends mixins(FullStoryMixin) {}
</script>
