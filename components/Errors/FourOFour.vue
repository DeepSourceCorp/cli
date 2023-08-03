<template>
  <div class="h-screen-dynamic four-o-four relative">
    <!-- Planet on top for Mobile -->
    <picture class="absolute right-0 top-0 lg:hidden">
      <source
        :srcset="require('~/assets/images/errors/404/planet-top-mobile.webp')"
        type="image/webp"
      />
      <source
        :srcset="require('~/assets/images/errors/404/planet-top-mobile.png')"
        type="image/png"
      />
      <img :src="require('~/assets/images/errors/404/planet-top-mobile.png')" alt="" />
    </picture>

    <!-- Planet on top for Desktop -->
    <picture class="absolute right-0 top-0 hidden lg:inline">
      <source
        :srcset="require('~/assets/images/errors/404/planet-top-desktop.webp')"
        type="image/webp"
      />
      <source
        :srcset="require('~/assets/images/errors/404/planet-top-desktop.png')"
        type="image/png"
      />
      <img
        class="bottom-10"
        :src="require('~/assets/images/errors/404/planet-top-desktop.png')"
        alt=""
      />
    </picture>

    <div class="flex h-full flex-col items-center justify-center p-4 lg:p-0">
      <div class="text-container z-30 max-w-sm space-y-5 p-6 lg:max-w-lg lg:p-8 xl:max-w-2xl">
        <h1 class="text-2.5xl font-bold leading-none text-vanilla-100">
          <span class="text-vanilla-400"> 404 </span>
          Not Found
        </h1>

        <div class="space-y-3">
          <h2 class="text-base font-semibold text-vanilla-200 lg:text-lg">
            This dimension doesn't exist...
          </h2>

          <p class="text-sm font-medium text-vanilla-400 lg:text-base">
            We couldn’t find a page at the URL you’re on. You can try
            <span class="font-semibold text-juniper-400"
              ><nuxt-link :to="loginUrl">logging in</nuxt-link></span
            >
            or going back to the
            <span class="font-semibold text-juniper-400"><a href="/">homepage</a></span
            >.
          </p>
        </div>
      </div>
    </div>

    <picture class="absolute bottom-60 left-0 lg:bottom-20">
      <source
        :srcset="require('~/assets/images/errors/404/left-static-desktop.webp')"
        type="image/webp"
      />
      <source
        :srcset="require('~/assets/images/errors/404/left-static-desktop.png')"
        type="image/png"
      />
      <img :src="require('~/assets/images/errors/404/left-static-desktop.png')" alt="" />
    </picture>

    <picture class="absolute bottom-10 right-0">
      <source
        :srcset="require('~/assets/images/errors/404/right-static-desktop.webp')"
        type="image/webp"
      />
      <source
        :srcset="require('~/assets/images/errors/404/right-static-desktop.png')"
        type="image/png"
      />
      <img :src="require('~/assets/images/errors/404/right-static-desktop.png')" alt="" />
    </picture>

    <!-- Cloud on the bottom left only shows up on Desktop -->
    <picture class="absolute bottom-0 z-20 hidden lg:block">
      <source
        :srcset="require('~/assets/images/errors/404/cloud-bottom-left-desktop.webp')"
        type="image/webp"
      />
      <source
        :srcset="require('~/assets/images/errors/404/cloud-bottom-left-desktop.png')"
        type="image/png"
      />
      <img :src="require('~/assets/images/errors/404/cloud-bottom-left-desktop.png')" alt="" />
    </picture>

    <div class="absolute bottom-0 w-screen overflow-hidden">
      <div class="flex items-end">
        <div class="max-h-screen-dynamic foreground z-10 mx-auto"></div>

        <img
          :src="require('~/assets/images/errors/404/smoke.gif')"
          alt=""
          class="max-h-screen-dynamic smoke absolute right-1/2 mx-auto hidden lg:inline"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

/**
 * 404 Error Page
 */
@Component({})
export default class FourOFour extends Vue {
  get loginUrl(): string {
    return this.$route.name?.startsWith('provider-owner')
      ? `/login?next=${this.$route.fullPath}`
      : '/login'
  }
}
</script>

<style lang="postcss" scoped>
.four-o-four {
  background: #01010f;
  background-size: cover;
  background-image: url('~/assets/images/errors/404/stars-bg-mobile.webp');
  background-image: image-set(
    url('~/assets/images/errors/404/stars-bg-mobile.webp') type('image/webp'),
    url('~/assets/images/errors/404/stars-bg-mobile.png') type('image/png')
  );
}

@media screen and (min-width: 1024px) {
  .four-o-four {
    background: #01010f;
    background-size: cover;
    background-image: url('~/assets/images/errors/404/stars-bg-desktop.webp');
    background-image: image-set(
      url('~/assets/images/errors/404/stars-bg-desktop.webp') type('image/webp'),
      url('~/assets/images/errors/404/stars-bg-desktop.png') type('image/png')
    );
  }
}

.foreground {
  width: 1263px;
  height: 256px;
  background-position: center;
  background-image: url(~/assets/images/errors/404/foreground-desktop.png);
  background-repeat: no-repeat;
}

.smoke {
  margin-right: -30rem;
  bottom: 5.5rem;
  height: 85px;
}

.text-container {
  background: rgba(92, 114, 207, 0.2);
  backdrop-filter: blur(4px);
  border-radius: 8px;
}
</style>
