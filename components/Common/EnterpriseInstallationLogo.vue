<template>
  <div class="flex items-center gap-x-4">
    <div class="logo-glow-bg">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_1292_3310)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M13.2417 12.4178H28.4483C29.7327 12.4178 30.8028 13.4763 30.8028 14.7448C30.8028 16.0136 29.7327 17.072 28.4483 17.072H13.2417V12.4178ZM13.2417 30.8215H31.8744C33.1588 30.8215 34.2305 31.8784 34.2305 33.1486C34.2305 34.4172 33.1588 35.4742 31.8744 35.4742H13.2417V30.8215ZM7.19189 44.9944V2.95166H22.1826C26.8415 2.95166 30.7496 3.95606 34.0162 6.01895C37.228 8.0293 39.6905 10.6732 41.2972 13.8981C42.904 17.1245 43.7597 20.5087 43.7597 23.9993C43.7597 27.5426 42.9572 30.9266 41.2972 34.1005C39.6905 37.3254 37.228 39.9168 34.0162 41.9796C30.8028 43.9885 26.8415 45.0469 22.1826 45.0469H9.97664C9.17251 44.9944 7.24509 44.9944 7.19189 44.9944ZM13.2417 21.6196H23.7893C25.0753 21.6196 26.1454 22.6766 26.1454 23.9468C26.1454 25.2154 25.0753 26.2738 23.7893 26.2738H13.2417V21.6196Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_1292_3310">
            <rect width="48" height="48" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
    <z-icon icon="move-horizontal" />
    <div class="logo-glow-bg my-auto">
      <img v-if="installationLogo" :src="installationLogo" class="h-12" />
      <svg
        v-else
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="14.4"
          height="14.4"
          rx="1.2"
          transform="matrix(1 0 0 -1 0 39.6001)"
          fill="#6784E2"
        />
        <rect
          width="14.4"
          height="14.4"
          rx="1.2"
          transform="matrix(1 0 0 -1 16.7998 39.6001)"
          fill="#6784E2"
        />
        <rect
          width="14.4"
          height="14.4"
          rx="1.2"
          transform="matrix(1 0 0 -1 33.6001 39.6001)"
          fill="#6784E2"
        />
        <rect
          width="14.4"
          height="14.4"
          rx="1.2"
          transform="matrix(1 0 0 -1 16.7998 22.8003)"
          fill="#6784E2"
        />
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({ name: 'EnterpriseInstallationLogo' })
export default class EnterpriseInstallationLogo extends Vue {
  @Prop({ default: '' })
  installationLogo: string
}
</script>

<style lang="postcss" scoped>
@tailwind base;
@tailwind utilities;

.logo-glow-bg {
  --angle: 0deg;
  padding: 10.6667px;
  border: theme('spacing.px') solid theme('colors.transparent');
  background:
    linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
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
