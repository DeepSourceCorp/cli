<template>
  <div class="h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl text-vanilla-100">Hello 👋</h1>
      <p class="text-vanilla-400">Please wait while we redirect you to the dashboard</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({ middleware: 'postAuth' })
export default class Auth extends Vue {}
</script>
