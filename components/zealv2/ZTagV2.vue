<template>
  <div
    class="box-border inline-flex items-center gap-x-2 rounded-full border px-2.5 py-px font-medium"
    :class="type"
  >
    <span class="z-tag--circle h-1.5 w-1.5 rounded-full bg-current"></span>
    <span class="z-tag--text text-xxs uppercase leading-6 tracking-wider"><slot></slot></span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

const variants = ['juniper', 'aqua', 'robin', 'honey', 'cherry']

@Component({ name: 'ZTagV2' })
export default class ZTagV2 extends Vue {
  @Prop({ type: String, required: true, validator: (value: string) => variants.includes(value) })
  type: string
}
</script>

<style lang="postcss" scoped>
/* CSS only for color logic */
.juniper {
  @apply border-juniper-500 border-opacity-10  bg-juniper-500 bg-opacity-5 text-juniper-300;

  > .z-tag--circle {
    @apply bg-current text-juniper-500;
  }
}

.robin {
  @apply border-robin-500 border-opacity-10  bg-robin-500 bg-opacity-5 text-robin-300;

  > .z-tag--circle {
    @apply bg-current text-robin-500;
  }
}

.aqua {
  @apply border-aqua-500 border-opacity-10  bg-aqua-500 bg-opacity-5 text-aqua-300;

  > .z-tag--circle {
    @apply bg-current text-aqua-500;
  }
}

.honey {
  @apply border-honey-500 border-opacity-10  bg-honey-500 bg-opacity-5 text-honey-300;

  > .z-tag--circle {
    @apply bg-current text-honey-500;
  }
}

.cherry {
  @apply border-cherry-500 border-opacity-10  bg-cherry-500 bg-opacity-5 text-cherry-300;

  > .z-tag--circle {
    @apply bg-current text-cherry-500;
  }
}
</style>
