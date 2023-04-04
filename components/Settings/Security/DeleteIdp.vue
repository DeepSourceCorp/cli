<template>
  <z-alert type="danger" class="border border-cherry-500 border-opacity-20">
    <!-- div wrapper to avoid `flex-grow` messing with layout -->
    <div>
      <z-button
        icon="trash-2"
        icon-color="current"
        button-type="danger"
        color="ink-400"
        size="small"
        class="float-right flex items-center gap-x-1"
        @click="$emit('confirm-idp-delete')"
      >
        Delete Provider
      </z-button>
      <p class="text-sm leading-4 text-cherry">Delete Identity Provider</p>
      <p class="mt-1.5 text-xs leading-6 text-cherry-300">
        Delete your Single Sign-On Identity Provider
      </p>
    </div>
  </z-alert>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZAlert, ZButton, ZIcon } from '@deepsource/zeal'

@Component({ components: { ZAlert, ZButton, ZIcon } })
export default class DeleteIdp extends Vue {}
</script>
