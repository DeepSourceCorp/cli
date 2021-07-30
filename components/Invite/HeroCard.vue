<template>
  <main class="min-h-screen flex flex-col relative">
    <img
      class="h-6 w-auto mx-auto my-5"
      src="~/assets/images/logo-wordmark-white.svg"
      alt="DeepSource"
    />
    <div class="grid place-content-center relative flex-grow">
      <div v-if="showBackground" class="h-full w-full absolute grid place-content-center">
        <img src="~/assets/images/installation-provider-bg.png" alt="bg" />
      </div>
      <transition
        enter-active-class="transition-all duration-500 ease-in-out"
        leave-active-class="transition-all duration-500 ease-in-out"
        enter-class="translate-y-0 scale-95 opacity-0"
        leave-to-class="translate-y-0 scale-105 opacity-0"
      >
        <div class="relative" :class="{ [customClass]: customClass }">
          <div
            v-if="showGlow"
            class="glow absolute inset-0 opacity-40 transform-gpu rounded-md scale-95"
          ></div>
          <div
            v-if="show"
            class="bg-ink-300 bg-opacity-40 blur border border-ink-100 rounded-lg transform-gpu p-6 sm:p-10 mx-2 sm:mx-0"
            :class="{
              'max-w-sm': width === 'sm',
              'max-w-md': width === 'md',
              'max-w-lg': width === 'lg'
            }"
          >
            <slot></slot>
          </div>
        </div>
      </transition>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component({})
export default class HeroCard extends Vue {
  @Prop({ default: true })
  showBackground: boolean

  @Prop({ default: false })
  showGlow: boolean

  @Prop({ default: 'md' })
  width: string

  @Prop({ default: '' })
  customClass: string

  show = false

  mounted() {
    setTimeout(() => {
      this.show = true
    }, 100)
  }
}
</script>
<style scoped>
.blur {
  backdrop-filter: blur(60px);
  -webkit-backdrop-filter: blur(60px);
}
.glow {
  box-shadow: -5px 0px 20px 20px rgba(1, 27, 115, 0.6), 5px 0px 20px 12px rgba(95, 26, 98, 0.8);
}
</style>
