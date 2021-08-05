<template>
  <div class="relative bg-ink-400">
    <div class="grid grid-cols-1 md:grid-cols-2 text-vanilla-100 min-h-screen">
      <div class="flex flex-col justify-center h-full">
        <div
          class="flex flex-col justify-between space-y-16 max-w-md mx-auto text-center lg:text-left px-6 py-24 lg:px-0 lg:py-0"
        >
          <div class="space-y-8">
            <img
              src="~/assets/images/logo-wordmark-white.svg"
              alt="DeepSource Logo"
              class="w-auto h-6"
            />
            <h1 class="leading-tight text-3xl font-bold text-left">
              Join the world's best developers
            </h1>
            <div
              class="flex flex-col items-center mt-8 space-y-4 left-section__btn-group sm:mt-16 sm:items-start"
            >
              <a
                v-for="opt in loginOptions"
                :key="opt.provider"
                :href="buildUrl(opt.provider)"
                class="flex items-center w-full left-section__btn"
              >
                <button
                  class="p-2 text-vanilla-100 w-full space-x-2 flex items-center rounded-sm justify-center hover:bg-opacity-90"
                  :class="opt.bg"
                >
                  <z-icon :icon="opt.icon" />
                  <span>Continue with {{ opt.label }}</span>
                </button>
              </a>
            </div>
          </div>
          <div class="flex flex-col space-y-4 text-left leading-relaxed">
            <div class="text-vanilla-400">
              By signing up, you are agreeing to our
              <a href="/terms" class="text-juniper hover:underline"> Terms of Service </a>
              and
              <a href="/privacy" class="text-juniper hover:underline">Privacy Policy</a>.
            </div>
            <div class="text-vanilla-400 border-t border-slate pt-4">
              Already have an account?
              <a href="/terms" class="text-juniper hover:underline">Log in</a>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 lg:px-12 bg-ink-300 min-h-full flex-col justify-center hidden md:flex">
        <div class="h-5/6">
          <z-carousel
            :showControls="false"
            autoTiming="8000"
            :autoSlide="true"
            class="max-w-lg mx-auto block"
          >
            <z-slide v-for="(testimonial, index) in testimonials" :key="index">
              <div class="space-y-4">
                <div class="space-y-2">
                  <div class="w-full">
                    <img
                      class="object-contain w-full h-40 lg:h-96"
                      :src="require(`~/assets/images/${testimonial.avatar}`)"
                      :alt="testimonial.author"
                    />
                  </div>
                  <div class="mt-4">
                    <p
                      class="text-lg leading-normal text-vanilla-300"
                      v-html="testimonial.body"
                    ></p>
                  </div>
                </div>
                <div class="desc text-vanilla-300">
                  <div class="name">{{ testimonial.author }}</div>
                  <div class="company text-vanilla-400">{{ testimonial.company }}</div>
                </div>
              </div>
            </z-slide>
          </z-carousel>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZDivider, ZIcon, ZCarousel, ZSlide, ZCard } from '@deepsourcelabs/zeal'
import AuthMixin from '~/mixins/authMixin'

export interface Testimonial {
  body?: string
  author?: string
  company?: string
  avatar?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    body:
      "DeepSource has made the code base <span class='bg-clip-text bg-gradient-to-r from-lavender to-pink text-transparent'> much more stable and dependable</span>. It allowed us to identify many more areas for improvement.",
    author: 'Piero Molino',
    company: 'Uber',
    avatar: 'testimonials/piero.png'
  },
  {
    body:
      "DeepSource provides a very nice <span class='bg-clip-text bg-gradient-to-r from-lavender to-pink text-transparent'>overview of issues</span> in our code.",
    author: 'Michal Čihař',
    company: 'Weblate',
    avatar: 'testimonials/michal.png'
  },
  {
    body:
      "DeepSource complements projects looking to embrace CI and source code quality as part of a larger DevOps strategy. It's been <span class='bg-clip-text bg-gradient-to-r from-lavender to-pink text-transparent'>very easy and a pleasure to use.</span>",
    author: 'Lewis McGibbney',
    company: 'NASA',
    avatar: 'testimonials/lewis.png'
  }
]

@Component({
  components: {
    ZButton,
    ZDivider,
    ZIcon,
    ZCarousel,
    ZSlide,
    ZCard
  },
  middleware: ['redirectToHome'],
  head: {
    title: 'Sign up — DeepSource'
  }
})
export default class SignUp extends mixins(AuthMixin) {
  public testimonials = TESTIMONIALS
}
</script>
