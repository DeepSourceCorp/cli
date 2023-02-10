<template>
  <div class="min-h-screen-dynamic bg-ink-400">
    <Nuxt />
    <portal-target class="z-1000" name="modal" @change="modalToggled"></portal-target>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import PortalMixin from '@/mixins/portalMixin'

@Component({
  components: {},
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2 hide-scroll'
    }
  }
})
export default class DefaultLayout extends mixins(PortalMixin) {}
</script>
