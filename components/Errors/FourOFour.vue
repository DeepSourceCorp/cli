<template>
  <div class="relative h-screen four-o-four">
    <div class="absolute inset-0">
      <div class="relative h-screen">
        <picture class="absolute left-0 hidden h-screen xl:block">
          <source
            class="h-screen"
            :srcset="require('~/assets/images/errors/404-bg-left.webp')"
            type="image/webp"
          />
          <source
            class="h-screen"
            :srcset="require('~/assets/images/errors/404-bg-left.png')"
            type="image/png"
          />
          <img :src="require('~/assets/images/errors/404-bg-left.png')" alt="" class="h-screen" />
        </picture>
        <picture class="absolute right-0 hidden h-screen xl:block">
          <source
            class="h-screen"
            :srcset="require('~/assets/images/errors/404-bg-right.webp')"
            type="image/webp"
          />
          <source
            class="h-screen"
            :srcset="require('~/assets/images/errors/404-bg-right.png')"
            type="image/png"
          />
          <img :src="require('~/assets/images/errors/404-bg-right.png')" alt="" class="h-screen" />
        </picture>
        <picture class="absolute hidden top-28 left-40 nebula lg:block">
          <source
            class="h-48"
            :srcset="require('~/assets/images/errors/nebula.webp')"
            type="image/webp"
          />
          <source
            class="h-48"
            :srcset="require('~/assets/images/errors/nebula.png')"
            type="image/png"
          />
          <img :src="require('~/assets/images/errors/nebula.png')" alt="" class="h-48" />
        </picture>
        <picture class="absolute top-15 right-15 rocket">
          <source
            class="h-20 md:h-28 lg:h-32"
            :srcset="require('~/assets/images/errors/rocket.webp')"
            type="image/webp"
          />
          <source
            class="h-20 md:h-28 lg:h-32"
            :srcset="require('~/assets/images/errors/rocket.png')"
            type="image/png"
          />
          <img
            :src="require('~/assets/images/errors/rocket.png')"
            alt=""
            class="h-20 md:h-28 lg:h-32"
          />
        </picture>
      </div>
    </div>
    <div class="absolute bottom-0 w-full">
      <div class="flex items-end">
        <img
          class="bottom-0 max-h-screen mx-auto left-10"
          :src="require('~/assets/images/errors/moon.png')"
          alt=""
        />
      </div>
    </div>
    <div class="absolute inset-0 bottom-0 flex flex-col justify-end w-full">
      <div
        class="flex flex-col items-center justify-between py-8 lg:justify-end h-2/3 lg:h-screen lg:space-y-12"
      >
        <div class="flex flex-col items-center justify-between text-center">
          <span
            class="text-2.5xl sm:text-3xl font-black tracking-widest text-vanilla-100 lg:text-ink-400"
          >
            404
          </span>
          <span
            class="max-w-md text-1.5xl sm:text-2xl font-black text-center text-vanilla-100 lg:text-ink-400"
          >
            This dimension doesn't exist... yet!
          </span>
          <div class="flex gap-x-5">
            <a href="/" class="norris-button btn-primary">Go home</a>
            <nuxt-link :to="loginUrl" class="norris-button btn-secondary">Login</nuxt-link>
          </div>
        </div>
        <span class="mx-auto text-vanilla-100 lg:text-ink-400">
          © {{ new Date().getFullYear() }}, DeepSource Corp.
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ZButton } from '@deepsourcelabs/zeal'

/**
 * 404 Error Page
 */
@Component({
  components: { ZButton }
})
export default class FourOFour extends Vue {
  get loginUrl(): string {
    return this.$route.name?.startsWith('provider-owner')
      ? `/login?next=${this.$route.fullPath}`
      : '/login'
  }
}
</script>

<style lang="scss" scoped>
@font-face {
  font-family: 'Retro Game';
  src: local('Retro Game'), url(~/assets/fonts/retro-gaming.ttf) format('truetype');
}

.four-o-four {
  background: #101116;
  background-size: contain;
  font-family: 'Retro Game', monospace;
  background-image: url(~/assets/images/errors/stars.png);

  cursor: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABFklEQVRYR9WXURLDIAhE6/0PbSdOtUpcd1Gnpv1KGpTHBpCE1/cXq+vrMph7dGvXZTtpfW10DCA5jrH1H0Jhs5E0hnZdCR+vb5S8Nn8mQCeS9BdSalYJqMBjAGzq59xAESN7VFVUgV8AZB/dZBR7QTFDCqGquvUBVVoEtgIwpQRzmANSFHgWQKExHdIrPeuMvQNDarXe6nC/AutgV3JW+6bgqQLeV8FekRtgV+ToDKEKnACYKsfZjjkam7a0ZpYTytwmgainpC3HvwBocgKOxqRjehoR9DFKNFYtOwCGYCszobeCbl26N6yyQ6g8X/Wex/rBPsNEV6qAMaJPMynIHQCoSqS9JSMmwef51LflTgCRszU7DvAGiV6mHWfsaVUAAAAASUVORK5CYII=),
    auto;

  .rocket {
    animation: floating 5s steps(4, end) infinite;
  }

  .nebula {
    animation: filter-animation 12s ease-in-out infinite;
  }
}

.norris-button {
  @apply px-3 py-1 text-lg mt-8 border-solid border-4 relative inline-block text-center select-none;

  border-image-slice: 2;
  border-image-width: 2;
  border-image-repeat: stretch;
  border-image-source: url('data:image/svg+xml;utf8,<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="5" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h-1 z M1 2 h1 v1 h-1 z M3 2 h1 v1 h-1 z M2 3 h1 v1 h-1 z" fill="rgb(22, 24, 29)" /></svg>');
  border-image-outset: 2;
  border-image-repeat: space;
  cursor: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAzElEQVRYR+2X0Q6AIAhF5f8/2jYXZkwEjNSVvVUjDpcrGgT7FUkI2D9xRfQETwNIiWO85wfINfQUEyxBG2ArsLwC0jioGt5zFcwF4OYDPi/mBYKm4t0U8ATgRm3ThFoAqkhNgWkA0jJLvaOVSs7j3qMnSgXWBMiWPXe94QqMBMBc1VZIvaTu5u5pQewq0EqNZvIEMCmxAawK0DNkay9QmfFNAJUXfgGgUkLaE7j/h8fnASkxHTz0DGIBMCnBeeM7AArpUd3mz2x3C7wADglA8BcWMZhZAAAAAElFTkSuQmCC)
      14 0,
    pointer;

  &::after {
    @apply absolute;

    top: -4px;
    right: -4px;
    bottom: -4px;
    left: -4px;
    content: '';
  }

  &.btn-primary {
    @apply bg-juniper text-ink-400;

    &:focus {
      box-shadow: 0 0 0 6px rgba(#2eb78b, 0.3);
    }

    &:active::after {
      box-shadow: inset 5px 5px #2eb78b;
      @apply border-juniper-600;
    }

    &::after {
      box-shadow: inset -5px -5px #2eb78b;
    }
  }

  &.btn-secondary {
    @apply bg-ink-100 text-vanilla-100;

    &:focus {
      box-shadow: 0 0 0 6px rgba(#23262e, 0.3);
    }

    &:active::after {
      box-shadow: inset 5px 5px #23262e;
      @apply border-juniper-600;
    }

    &::after {
      box-shadow: inset -5px -5px #23262e;
    }
  }
}

@keyframes floating {
  0% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(10px);
  }
  50% {
    transform: translateY(0px);
  }
  75% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes filter-animation {
  0% {
    filter: hue-rotate(0deg);
  }

  50% {
    filter: hue-rotate(100deg);
  }

  100% {
    filter: hue-rotate(0deg);
  }
}
</style>
