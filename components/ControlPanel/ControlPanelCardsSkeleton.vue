<template>
  <div class="p-4 space-y-5">
    <div v-for="i in cardCount" :key="i" class="h-17 bg-ink-300 animate-pulse"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component({
  name: 'ControlPanelCardSkeleton'
})
export default class ControlPanelCardSkeleton extends Vue {
  @Prop({ default: 5 })
  cardCount: number
}
</script>
