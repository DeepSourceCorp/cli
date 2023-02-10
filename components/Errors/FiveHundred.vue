<template>
  <div class="relative h-screen five-hundred">
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
        <picture class="absolute bottom-0 -left-10 lg:left-0 w-screen lg:w-auto">
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
        <picture class="absolute left-0 bottom-0 hidden lg:block z-20">
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
        <div class="max-h-screen mx-auto z-10 foreground"></div>
        <img
          :src="require('~/assets/images/errors/500/smoke.gif')"
          alt=""
          class="absolute max-h-screen mx-auto right-1/2 smoke"
        />
      </div>
    </div>

    <div class="flex flex-col items-center justify-center h-full p-4 lg:p-0">
      <div class="p-6 space-y-5 max-w-sm text-container z-30 lg:p-8 lg:max-w-lg xl:max-w-2xl">
        <h1 class="text-2.5xl leading-none font-bold text-vanilla-100">
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
                class="text-vanilla-100 font-semibold"
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

<style lang="scss" scoped>
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
