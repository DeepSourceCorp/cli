<template>
  <div class="p-4 text-lg font-medium">{{ helloText }}</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class Greeting extends Vue {
  @Prop({ default: null })
  firstName: string

  get greeting(): string {
    const now = new Date().getHours()
    switch (true) {
      case now < 12:
        return `Good morning`
      case now >= 12 && now <= 17:
        return `Good afternoon`
      case now >= 17 && now <= 24:
        return `Good evening`
      default:
        return `Hey`
    }
  }

  get emoji(): string {
    const today = new Date()
    if (today.getMonth() === 9 && today.getDate() === 31) {
      // Halloween
      return '🎃'
    }
    return '👋'
  }

  get helloText(): string {
    return this.firstName
      ? `${this.emoji} ${this.greeting}, ${this.firstName}.`
      : `${this.emoji} ${this.greeting}.`
  }
}
</script>
