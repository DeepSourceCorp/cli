<template>
  <div class="flex w-full gap-x-2.5 pt-4">
    <div class="h-9 w-9 animate-pulse rounded-full bg-ink-300"></div>
    <div class="flex-grow pb-4" :class="{ 'border-b border-ink-300': !hideBorder }">
      <div class="h-10 animate-pulse rounded-md bg-ink-300"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * Loading state component for Member List Item
 */
@Component({
  name: 'MemberListItemLoading'
})
export default class MemberListItemLoading extends Vue {
  @Prop({ default: false })
  hideBorder: boolean
}
</script>
