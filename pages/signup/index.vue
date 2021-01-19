<template>
  <div class="mx-auto h-screen w-screen text-vanilla-100 flex">
    <div class="left-section w-full sm:w-7/12 bg-ink-400 flex flex-col justify-center items-center">
      <div class="left-content mt-16 sm:mt-0 w-4/5 sm:w-3/5 flex flex-col justify-center h-full sm:h-auto pt-2 pb-0.5 sm:pt-0 sm:pb-0">
        <div class="text-xl md:text-2xl text-center lg:text-3xl font-bold sm:text-left sm:mt-16">Analyze your code fix issues in seconds</div>
        <div class="left-section__btn-group mt-8 sm:mt-16 flex flex-col items-center sm:items-start">
          <div class="left-section__btn flex w-11/12">
            <z-button custom-classes="bg-ink-200 text-vanilla-100 w-full sm:w-full sm:w-full">
              <z-icon icon="github" position="left" class="-mt-1"/>
              <span>Continue with GitHub</span>
            </z-button>
          </div>
          <div class="left-section__btn mt-4 flex w-11/12">
            <z-button custom-classes="bg-gitlab text-vanilla-100 w-full sm:w-full sm:w-full">
              <z-icon icon="gitlab" position="left" class="-mt-1"/>
              <span>Continue with GitLab</span>
            </z-button>
          </div> 
          <div class="left-section__btn mt-4 flex w-11/12">
            <z-button custom-classes="bg-bitbucket text-vanilla-100 sm:w-full sm:w-full w-full">
              <z-icon icon="bitbucket" position="left" class="-mt-1"/>
              <span>Continue with Bitbucket</span>
            </z-button>
          </div> 
        </div>
        <div class="support flex flex-col-reverse mt-8 items-center sm:flex-col sm:items-left xl:flex-col xl:items-left">
          <div class="text-center sm:text-left mt-4 sm:w-full">
            <div class="sm:mt-8 text-xs sm:text-sm text-vanilla-400 mt-0 mb-4">By signing up, you are agreeing to our <z-button to="https://www.goodreads.com/" type="link" color="link" size="small" class="login-section__link mt-px" custom-classes="text-xs sm:text-sm">Terms of Service</z-button> and <z-button to="https://www.goodreads.com/" type="link" color="link" size="small" class="login-section__link mt-px m-0" custom-classes="text-xs sm:text-sm">Privacy Policy</z-button>.</div>
            <div class="text-xs sm:text-sm text-vanilla-400">Trouble signing up? <z-button to="https://www.goodreads.com/" type="link" color="link" class="login-section__link mt-px m-0" size="small" custom-classes="text-xs sm:text-sm">Contact support</z-button></div>
          </div>
          <z-divider></z-divider>
          <div class="login-section text-vanilla-400 text-sm -mt-1 sm:mb-12 w-full text-center sm:text-left mb-8 sm:mb-0">
            Already have an account? <z-button to="https://www.goodreads.com/" type="link" color="link" class="login-section__link mt-px m-0" size="small" custom-classes="text-sm">Log in</z-button>
          </div>
        </div>
      </div>
    </div>
    <div class="right-section w-5/12 bg-ink-300 flex flex-col justify-center items-center hidden sm:flex">
      <div class="testimonial-container h-102 w-3/4">
        <z-carousel :showControls="false"
                    autoTiming="5000"
                    :autoSlide="true">
            <z-slide v-for="(testimonial, index) in testimonials" :key="index">
              <z-card>
                <template slot="header">
                  <div class="h-64 bg-cover w-full bg-local" :style="{backgroundImage: `url(${testimonial.avatar_url})`}"></div>
                </template>
                <template slot="body">
                  <p class="mt-8 text-lg text-vanilla-300 md:text-xl" v-html="testimonial.body"></p>
                </template>
                <template slot="footer">
                  <div class="desc text-vanilla-300">
                    <div class="name">{{testimonial.author_name}}</div>
                    <div class="company text-vanilla-400">{{testimonial.company}}</div>
                  </div>
                </template>
              </z-card>
            </z-slide>
        </z-carousel>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';
import { ZButton, ZDivider, ZIcon, ZCarousel, ZSlide, ZCard } from "@deepsourcelabs/zeal";
import { Testimonial } from '~/types/types';
import { contentFunc } from '@nuxt/content/types/content';

@Component({
  components: {
    ZButton,
    ZDivider,
    ZIcon,
    ZCarousel,
    ZSlide,
    ZCard
  }
})

export default class SignUp extends Vue {
private testimonials: Array<Testimonial> = [];
  content: Array<Testimonial> = [];
  created() {
    this.testimonials = this.content;
  }
  async asyncData({ $content }: {$content: contentFunc}) {
    const content = await $content('').fetch()
    return { content }
  }
}
</script>

