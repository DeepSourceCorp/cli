<template>
  <h2>Hello</h2>
</template>

<script lang="ts">
import Vue from 'vue'
import { Context } from '@nuxt/types'
export default Vue.extend({
  middleware: [
    function ({ redirect, route }: Context): void {
      const queryParams = route.query
      redirect(302, '/installation/bb', queryParams)
    }
  ]
})
</script>
