<template>
  <div class="flex w-full my-4 gap-x-2.5 animate-pulse">
    <div class="rounded-full w-8 h-8 bg-ink-300"></div>
    <div class="flex-grow h-10 rounded-md bg-ink-300"></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

/**
 * Loading state component for Member List Item
 */
@Component({
  name: 'MemberListItemLoading'
})
export default class MemberListItemLoading extends Vue {}
</script>
