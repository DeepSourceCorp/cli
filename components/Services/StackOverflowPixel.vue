<template>
  <!-- Activity name for this tag: Deepsource__ThankYouPage_Pixel_PostConversionPixel_PageView -->
  <client-only>
    <img
      v-if="!$config.onPrem"
      :src="`https://pubads.g.doubleclick.net/activity;xsp=4892488;ord=${String(
        Math.floor(Math.random() * 10000000000000000)
      )}?`"
      class="w-px h-px border-none invisible"
    />
  </client-only>
</template>
