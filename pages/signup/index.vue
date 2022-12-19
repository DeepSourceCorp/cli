<template>
  <div class="relative bg-ink-400">
    <div class="grid min-h-screen grid-cols-1 md:grid-cols-2 text-vanilla-100">
      <div class="flex flex-col justify-center h-full">
        <div
          class="flex flex-col justify-between max-w-md px-6 py-24 mx-auto space-y-16 text-center lg:text-left lg:px-0 lg:py-0"
        >
          <div class="space-y-8">
            <img
              src="~/assets/images/logo-wordmark-white.svg"
              alt="DeepSource Logo"
              class="w-auto h-6"
            />
            <h1 class="text-3xl font-bold leading-tight text-left">
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
                  class="flex items-center justify-center w-full p-2 space-x-2 rounded-sm text-vanilla-100 hover:bg-opacity-90"
                  :class="opt.bg"
                >
                  <z-icon :icon="opt.icon" />
                  <span>Continue with {{ opt.label }}</span>
                </button>
              </a>
            </div>
          </div>
          <div class="flex flex-col space-y-4 leading-relaxed text-left">
            <div class="text-vanilla-400">
              By signing up, you are agreeing to our
              <a href="/terms-of-service" class="text-juniper hover:underline">
                Terms of Service
              </a>
              and
              <a href="/privacy" class="text-juniper hover:underline">Privacy Policy</a>.
            </div>
            <div class="pt-4 border-t text-vanilla-400 border-slate">
              Already have an account?
              <a href="/login" class="text-juniper hover:underline">Log in</a>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-col justify-center hidden min-h-full px-8 lg:px-12 bg-ink-300 md:flex">
        <div class="h-5/6">
          <z-carousel
            :showControls="false"
            autoTiming="8000"
            :autoSlide="true"
            class="block max-w-lg mx-auto"
          >
            <z-slide v-for="(testimonial, index) in testimonials" :key="index">
              <div class="w-full">
                <img
                  class="object-contain w-full h-40 lg:h-96"
                  :src="require(`~/assets/images/${testimonial.avatar}`)"
                  :alt="testimonial.author"
                />
              </div>
              <p
                class="box-content max-w-lg mt-4 text-lg leading-normal text-vanilla-300"
                v-html="testimonial.body"
              ></p>
              <div class="mt-4 desc text-vanilla-300">
                <div class="name">{{ testimonial.author }}</div>
                <div class="company text-vanilla-400">{{ testimonial.company }}</div>
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
import { ZButton, ZDivider, ZIcon, ZCarousel, ZSlide, ZCard } from '@deepsource/zeal'
import AuthMixin from '~/mixins/authMixin'
import MetaMixin from '~/mixins/metaMixin'

export interface Testimonial {
  body?: string
  author?: string
  company?: string
  avatar?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    body: "DeepSource has made the code base <span class='text-transparent bg-clip-text bg-gradient-to-r from-lavender to-pink'> much more stable and dependable</span>. It allowed us to identify many more areas for improvement.",
    author: 'Piero Molino',
    company: 'Uber',
    avatar: 'testimonials/piero.png'
  },
  {
    body: "DeepSource provides a very nice <span class='text-transparent bg-clip-text bg-gradient-to-r from-lavender to-pink'>overview of issues</span> in our code.",
    author: 'Michal Čihař',
    company: 'Weblate',
    avatar: 'testimonials/michal.png'
  },
  {
    body: "DeepSource complements projects looking to embrace CI and source code quality as part of a larger DevOps strategy. It's been <span class='text-transparent bg-clip-text bg-gradient-to-r from-lavender to-pink'>very easy and a pleasure to use.</span>",
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
  middleware: [
    'redirectToHome',
    ({ $config, redirect, route }) => {
      if ($config.onPrem) {
        const { next } = route.query
        if (next) {
          redirect(302, { path: '/login', query: { next } })
        } else {
          redirect(302, `/login`)
        }
      }
    }
  ],
  head() {
    return {
      title: 'Sign up — DeepSource',
      link: [
        {
          rel: 'canonical',
          href: `https://${this.$config.domain}/signup`
        }
      ]
    }
  }
})
export default class SignUp extends mixins(AuthMixin, MetaMixin) {
  public testimonials = TESTIMONIALS
  metaTitle = 'Sign up - DeepSource'
  setCanonical = true
}
</script>
