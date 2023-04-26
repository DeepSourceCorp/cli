<template>
  <div class="relative bg-ink-400">
    <div class="grid min-h-screen grid-cols-1 text-vanilla-100 md:grid-cols-2">
      <div class="flex h-full flex-col justify-center">
        <div
          class="mx-auto flex max-w-md flex-col justify-between space-y-16 px-6 py-24 text-center lg:px-0 lg:py-0 lg:text-left"
        >
          <div class="space-y-8">
            <img
              src="~/assets/images/logo-wordmark-white.svg"
              alt="DeepSource Logo"
              class="h-6 w-auto"
            />
            <h1 class="text-left text-3xl font-bold leading-tight">
              Join the world's best developers
            </h1>
            <div
              class="left-section__btn-group mt-8 flex flex-col items-center space-y-4 sm:mt-16 sm:items-start"
            >
              <a
                v-for="opt in loginOptions"
                :key="opt.provider"
                :href="buildUrl(opt.provider)"
                class="left-section__btn flex w-full items-center"
              >
                <button
                  class="flex w-full items-center justify-center space-x-2 rounded-sm p-2 text-vanilla-100 hover:bg-opacity-90"
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
              <a href="https://deepsource.com/legal/terms" class="text-juniper hover:underline">
                Terms of Service</a
              >,
              <a href="https://deepsource.com/legal/msa" class="text-juniper hover:underline">
                Master Subscription Agreement</a
              >
              and
              <a href="https://deepsource.com/legal/privacy" class="text-juniper hover:underline"
                >Privacy Policy</a
              >.
            </div>
            <div class="border-t border-slate pt-4 text-vanilla-400">
              Already have an account?
              <a href="/login" class="text-juniper hover:underline">Log in</a>
            </div>
          </div>
        </div>
      </div>
      <div class="hidden min-h-full flex-col justify-center bg-ink-300 px-8 md:flex lg:px-12">
        <div class="h-5/6">
          <z-carousel
            :show-controls="false"
            auto-timing="8000"
            :auto-slide="true"
            class="mx-auto block max-w-lg"
          >
            <z-slide v-for="(testimonial, index) in testimonials" :key="index">
              <div class="w-full">
                <img
                  class="h-40 w-full object-contain lg:h-96"
                  :src="require(`~/assets/images/${testimonial.avatar}`)"
                  :alt="testimonial.author"
                />
              </div>
              <p
                class="mt-4 box-content max-w-lg text-lg leading-normal text-vanilla-300"
                v-html="testimonial.body"
              ></p>
              <div class="desc mt-4 text-vanilla-300">
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
