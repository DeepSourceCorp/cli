<template>
  <div class="z-carousel__wrapper relative h-full">
    <div
      v-show="componentMounted"
      class="z-carousel__container relative z-10 h-full overflow-hidden"
    >
      <slot></slot>
    </div>
    <div v-show="showControls" class="z-carousel__controls">
      <!-- prettier-ignore -->
      <button
        class="z-carousel__control z-carousel__control--left left-0 top-50 absolute h-12 w-12 z-20 -mt-6 flex bg-ink-100 bg-opacity-75 justify-center items-center"
        @click="showPrevSlide"
      >
        <z-icon icon="arrow-left" />
      </button>
      <!-- prettier-ignore -->
      <button
        class="z-carousel__control z-carousel__control--right right-0 top-50 absolute h-12 w-12 z-20 -mt-6 flex bg-ink-100 bg-opacity-75 justify-center items-center"
        @click="showNextSlide"
      >
        <z-icon icon="arrow-right" />
      </button>
    </div>
    <ul
      v-show="showIndicators"
      class="z-indicators absolute mt-4 flex w-full gap-x-1 md:gap-x-1.5"
      :class="[getIndicatorPositionClass]"
    >
      <li
        v-for="(slide, index) in slides"
        :key="index"
        class="h-2 w-2 cursor-pointer rounded-full"
        :class="['z-indicator', `${index == currentIndex ? 'bg-juniper' : 'bg-ink-100'}`]"
        @click.stop="showSlide(index)"
      >
        <button class="z-indicator__button"></button>
      </li>
    </ul>
  </div>
</template>

<script>
import ZIcon from '../ZIcon'

export default {
  name: 'ZCarousel',
  props: {
    activeIndex: {
      default: 0,
      type: Number
    },
    indicatorPosition: {
      default: 'left',
      type: String
    },
    showIndicators: {
      default: true,
      type: Boolean
    },
    autoSlide: {
      default: true,
      type: Boolean
    },
    autoTiming: {
      default: '3000',
      type: String
    },
    showControls: {
      default: true,
      type: Boolean
    }
  },
  data() {
    return {
      currentIndex: this.activeIndex || 0,
      autoTimeout: null,
      slides: [],
      slideDirection: '',
      componentMounted: false
    }
  },
  computed: {
    slidesLength() {
      return this.slides.length
    },
    reachedMaxLeft() {
      return this.currentIndex === 0
    },
    getIndicatorPositionClass() {
      const positions = {
        left: 'justify-start',
        right: 'justify-end',
        center: 'justify-center'
      }
      return positions[this.indicatorPosition] || positions['left']
    }
  },
  methods: {
    showNextSlide() {
      this.currentIndex++
      if (this.currentIndex >= this.slidesLength) {
        this.currentIndex = 0
      }
      this.slideDirection = 'slide-right'
      if (this.autoSlide) this.resetAutoSlide()
    },

    showPrevSlide() {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.slidesLength - 1
      }
      this.slideDirection = 'slide-left'
      if (this.autoSlide) this.resetAutoSlide()
    },

    showSlide(slideIndex) {
      if (slideIndex > this.currentIndex) this.slideDirection = 'slide-right'
      else this.slideDirection = 'slide-left'
      this.currentIndex = slideIndex
    },

    triggerAutoSlide() {
      this.autoTimeout = setTimeout(() => {
        this.showNextSlide()
      }, parseInt(this.autoTiming))
    },

    cancelAutoSlide() {
      clearTimeout(this.autoTimeout)
    },

    resetAutoSlide() {
      this.cancelAutoSlide()
      this.triggerAutoSlide()
    }
  },
  watch: {
    activeIndex() {
      this.showSlide(this.activeIndex)
    }
  },
  mounted() {
    this.slides = this.$children.filter((child) => child.$options.name === 'ZSlide')
    this.slides.map((slide, index) => {
      slide.index = index
    })
    if (this.autoSlide) this.triggerAutoSlide()
    this.componentMounted = true
  },
  beforeDestroy() {
    this.cancelAutoSlide()
  }
}
</script>
