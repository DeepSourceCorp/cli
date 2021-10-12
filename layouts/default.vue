<template>
  <div class="bg-ink-400">
    <Nuxt />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component({
  components: {},
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2'
    }
  }
})
export default class DefaultLayout extends Vue {}
</script>
