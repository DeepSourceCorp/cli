<template>
  <main class="relative flex min-h-screen flex-col">
    <img
      class="mx-auto mt-12 h-6 w-auto md:mt-24"
      src="~/assets/images/logo-wordmark-white.svg"
      alt="DeepSource"
    />
    <div class="relative grid flex-grow place-content-center">
      <div v-if="showBackground" class="absolute grid h-full w-full place-content-center">
        <img src="~/assets/images/installation-provider-bg.png" alt="bg" />
      </div>
      <transition
        enter-active-class="transition-all duration-500 ease-in-out"
        leave-active-class="transition-all duration-500 ease-in-out"
        enter-class="scale-95 translate-y-0 opacity-0"
        leave-to-class="scale-105 translate-y-0 opacity-0"
      >
        <div class="relative" :class="{ [customClass]: Boolean(customClass) }">
          <div
            v-if="showGlow"
            class="glow absolute inset-0 scale-95 transform-gpu rounded-md opacity-40 no-filter:bg-opacity-80"
          ></div>
          <div
            v-if="show"
            class="mx-2 transform-gpu rounded-lg p-6 sm:mx-0 sm:p-10"
            :class="[
              {
                'max-w-sm': width === 'sm',
                'max-w-md': width === 'md',
                'max-w-lg': width === 'lg',
                'max-w-xl': width === 'xl',
                'max-w-2xl': width === '2xl',
                'max-w-3xl': width === '3xl',
                'max-w-4xl': width === '4xl'
              },
              { 'border border-slate-400 bg-ink-400 bg-opacity-40 backdrop-blur-3xl': showBorder }
            ]"
          >
            <slot></slot>
          </div>
        </div>
      </transition>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

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

  @Prop({ default: true })
  showBorder: boolean

  show = false

  mounted() {
    setTimeout(() => {
      this.show = true
    }, 100)
  }
}
</script>
<style scoped>
.glow {
  box-shadow:
    -5px 0px 20px 20px rgba(1, 27, 115, 0.6),
    5px 0px 20px 12px rgba(95, 26, 98, 0.8);
}
</style>
