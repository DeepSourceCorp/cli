<template>
  <main class="relative flex flex-col min-h-screen">
    <img
      class="w-auto h-6 mx-auto my-5"
      src="~/assets/images/logo-wordmark-white.svg"
      alt="DeepSource"
    />
    <div class="relative grid flex-grow place-content-center">
      <div v-if="showBackground" class="absolute grid w-full h-full place-content-center">
        <img src="~/assets/images/installation-provider-bg.png" alt="bg" />
      </div>
      <transition
        enter-active-class="transition-all duration-500 ease-in-out"
        leave-active-class="transition-all duration-500 ease-in-out"
        enter-class="scale-95 translate-y-0 opacity-0"
        leave-to-class="scale-105 translate-y-0 opacity-0"
      >
        <div class="relative" :class="{ [customClass]: customClass }">
          <div
            v-if="showGlow"
            class="
              absolute
              inset-0
              scale-95
              rounded-md
              glow
              opacity-40
              no-filter:bg-opacity-80
              transform-gpu
            "
          ></div>
          <div
            v-if="show"
            class="
              p-6
              mx-2
              border
              rounded-lg
              bg-ink-400 bg-opacity-40
              blur
              border-ink-100
              transform-gpu
              sm:p-10 sm:mx-0
            "
            :class="{
              'max-w-sm': width === 'sm',
              'max-w-md': width === 'md',
              'max-w-lg': width === 'lg',
              'max-w-xl': width === 'xl',
              'max-w-2xl': width === '2xl'
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
