<template>
  <div class="space-y-5 p-4">
    <div v-for="i in cardCount" :key="i" class="h-17 animate-pulse bg-ink-300"></div>
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
