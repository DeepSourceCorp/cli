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

    <div class="absolute inset-0 flex flex-col justify-end w-full">
      <div class="flex flex-col items-center justify-center py-8 px-6 h-screen">
        <div
          class="flex flex-col justify-between max-w-sm lg:max-w-lg xl:max-w-3xl space-y-4 p-8 z-30 text-container"
        >
          <span class="title leading-none font-bold text-vanilla-100 mb-2">
            <span class="text-vanilla-400">500</span> Server Error
          </span>
          <span class="text-sm lg:text-2xl font-semibold text-vanilla-200">
            Looks like something went wrong :(
          </span>
          <span class="text-sm lg:text-1.5xl font-medium text-vanilla-400"
            >Our engineers are working on a rescue mission.
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
            ></span
          >
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

.title {
  font-size: 30px;
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

@media (min-width: 1024px) {
  .title {
    font-size: 60px;
  }
}
</style>
