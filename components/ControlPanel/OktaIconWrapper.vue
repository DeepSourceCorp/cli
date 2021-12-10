<template>
  <div class="relative">
    <div class="flex items-center">
      <slot></slot>
    </div>
    <img
      v-if="isOkta"
      src="~/assets/images/control-panel/okta-indicator.svg"
      class="absolute bottom-0 right-0"
      :class="[dimensions]"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
@Component({
  name: 'OktaIconWrapper'
})
export default class OktaIconWrapper extends Vue {
  @Prop({ required: true })
  isOkta: boolean

  @Prop({ default: 'w-4 h-4' })
  dimensions: string
}
</script>
