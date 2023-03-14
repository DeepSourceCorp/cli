<template>
  <div class="relative min-h-screen overflow-hidden">
    <div class="bg-hero-layout-gradient"></div>
    <div
      class="flex flex-col h-full min-h-screen px-5 lg:px-10 py-6 lg:py-8 z-10 absolute inset-0 overflow-y-auto"
    >
      <div><slot name="header"></slot></div>
      <div class="flex-grow flex items-center justify-center py-8">
        <div class="flex flex-col items-center w-full sm:max-w-sm">
          <div class="deepsource-logo">
            <svg
              width="37"
              height="42"
              viewBox="0 0 37 42"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.69967 11.9517H21.6017C22.607 11.9517 23.4445 12.7802 23.4445 13.7731C23.4445 14.7661 22.607 15.5945 21.6017 15.5945H9.69967V11.9517ZM9.69967 26.3561H24.2833C25.2885 26.3561 26.1273 27.1834 26.1273 28.1775C26.1273 29.1704 25.2885 29.9977 24.2833 29.9977H9.69967V26.3561ZM4.9646 37.449V4.54266H16.6976C20.3441 4.54266 23.4029 5.3288 25.9595 6.9434C28.4734 8.51688 30.4008 10.5862 31.6583 13.1103C32.9159 15.6356 33.5857 18.2843 33.5857 21.0165C33.5857 23.7897 32.9575 26.4383 31.6583 28.9225C30.4008 31.4467 28.4734 33.4749 25.9595 35.0894C23.4445 36.6617 20.3441 37.4902 16.6976 37.4902H7.14418C6.5148 37.449 5.00623 37.449 4.9646 37.449ZM9.69967 19.1539H17.9551C18.9616 19.1539 19.7992 19.9812 19.7992 20.9753C19.7992 21.9683 18.9616 22.7967 17.9551 22.7967H9.69967V19.1539Z"
                fill="white"
              />
            </svg>
          </div>
          <div class="mt-8 w-full text-center space-y-3">
            <h1 :key="samlLogin" class="text-vanilla-100 text-lg font-medium leading-6">
              <slot name="title"></slot>
            </h1>
            <div v-if="$slots.subtitle" class="text-vanilla-400 text-base leading-8">
              <slot name="subtitle"></slot>
            </div>
          </div>
          <div class="mt-9 w-full">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({})
export default class HeroLayout extends Vue {
  @Prop({ default: false, type: Boolean })
  hasTransition: boolean
}
</script>

<style lang="postcss" scoped>
@tailwind base;
@tailwind utilities;

.bg-hero-layout-gradient {
  position: absolute;
  width: 956px;
  height: 956px;
  left: -298px;
  margin-left: auto;
  margin-right: auto;
  top: -530px;

  background: linear-gradient(
    180deg,
    rgba(69, 175, 220, 0.6) 64.4%,
    rgba(59, 100, 236, 0.6) 76.78%,
    rgba(69, 104, 220, 0) 100%
  );
  opacity: 0.12;
  box-shadow: 0px 10.5635px 660.221px 5281.77px rgba(0, 0, 0, 0.25);
  filter: blur(158.453px);
}

@media screen and (min-width: 768px) {
  .bg-hero-layout-gradient {
    width: 75%;
    left: 0;
    right: 0;
  }
}

.deepsource-logo {
  --angle: 0deg;
  padding: 10.6667px;
  border: theme('spacing.px') solid theme('colors.transparent');
  background: linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
    linear-gradient(var(--angle), rgba(255, 255, 255, 0.2) 14.99%, rgba(255, 255, 255, 0.02) 77.27%)
      border-box;
  backdrop-filter: blur(21.3333px);
  border-radius: theme('borderRadius.lg');
  animation: 8.5s rotate linear infinite;
}

@keyframes rotate {
  to {
    --angle: 360deg;
  }
}

@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
</style>
