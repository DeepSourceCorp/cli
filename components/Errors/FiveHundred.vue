<template>
  <div class="five-hundred relative h-screen">
    <div class="absolute inset-0">
      <div class="relative h-screen overflow-hidden">
        <!-- mobile top bg -->
        <picture class="absolute right-0 top-0 lg:hidden">
          <source
            :srcset="require('~/assets/images/errors/500/500-bg-top-mobile.webp')"
            type="image/webp"
          />
          <source
            :srcset="require('~/assets/images/errors/500/500-bg-top-mobile.png')"
            type="image/png"
          />
          <img :src="require('~/assets/images/errors/500/500-bg-top-mobile.png')" alt="" />
        </picture>
        <!-- desktop left bg behind-->
        <picture class="absolute -left-10 bottom-0 w-screen lg:left-0 lg:w-auto">
          <source
            :srcset="require('~/assets/images/errors/500/500-bg-left.webp')"
            type="image/webp"
          />
          <source
            :srcset="require('~/assets/images/errors/500/500-bg-left.png')"
            type="image/png"
          />
          <img :src="require('~/assets/images/errors/500/500-bg-left.png')" alt="" />
        </picture>
        <!-- desktop left bg in front -->
        <picture class="absolute bottom-0 left-0 z-20 hidden lg:block">
          <source
            :srcset="require('~/assets/images/errors/500/500-fg-left.webp')"
            type="image/webp"
          />
          <source
            :srcset="require('~/assets/images/errors/500/500-fg-left.png')"
            type="image/png"
          />
          <img :src="require('~/assets/images/errors/500/500-fg-left.png')" alt="" />
        </picture>
        <!-- desktop right bg -->
        <picture class="absolute right-0 hidden h-screen lg:block">
          <source
            :srcset="require('~/assets/images/errors/500/500-bg-right.webp')"
            type="image/webp"
            class="h-screen"
          />
          <source
            :srcset="require('~/assets/images/errors/500/500-bg-right.png')"
            type="image/png"
            class="h-screen"
          />
          <img
            :src="require('~/assets/images/errors/500/500-bg-right.png')"
            alt=""
            class="h-screen"
          />
        </picture>
      </div>
    </div>
    <div class="absolute bottom-0 w-screen overflow-hidden">
      <div class="flex items-end">
        <div class="foreground z-10 mx-auto max-h-screen"></div>
        <img
          :src="require('~/assets/images/errors/500/smoke.gif')"
          alt=""
          class="smoke absolute right-1/2 mx-auto max-h-screen"
        />
      </div>
    </div>

    <div class="flex h-full flex-col items-center justify-center p-4 lg:p-0">
      <div class="text-container z-30 max-w-sm space-y-5 p-6 lg:max-w-lg lg:p-8 xl:max-w-2xl">
        <h1 class="text-2.5xl font-bold leading-none text-vanilla-100">
          <span class="text-vanilla-400">500</span> Server Error
        </h1>

        <div class="space-y-3">
          <h2 class="text-base font-semibold text-vanilla-200 lg:text-lg">
            Looks like something went wrong :(
          </h2>

          <p class="text-sm font-medium text-vanilla-400 lg:text-base">
            Our engineers are working on a rescue mission.
            <span v-if="!$config.onPrem"
              >Check out
              <a
                href="https://deepsourcestatus.com"
                target="_blank"
                rel="noreferrer noopener"
                class="font-semibold text-vanilla-100"
                >deepsourcestatus.com</a
              >
              for updates.</span
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

/**
 * 500 Error Page
 */
@Component({
  components: {}
})
export default class FiveHundred extends Vue {}
</script>

<style scoped>
.five-hundred {
  background: #120000;
  background-size: contain;
  background-image: url(~/assets/images/errors/500/stars.png);
}

.text-container {
  background: #5c72cf33;
  border-radius: 8px;
}

.foreground {
  width: 1538px;
  height: 196px;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(~/assets/images/errors/500/500-fg.png);
}

.smoke {
  margin-right: -35rem;
  bottom: 5.5rem;
  height: 85px;
}
</style>
