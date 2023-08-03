<template>
  <div class="space-y-2">
    <div class="space-y-1.5">
      <label :for="id" class="text-sm font-medium text-vanilla-400 md:text-base"
        >{{ label }} <span class="text-cherry-500">*</span></label
      >

      <slot></slot>
    </div>

    <transition name="fade">
      <p
        v-if="errCondition"
        class="inline-flex items-center gap-x-2 text-xs text-cherry-500 md:text-sm"
      >
        <z-icon icon="alert-circle" color="cherry" size="x-small" /> {{ errMsg }}
      </p>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({
  name: 'FormField'
})
export default class FormField extends Vue {
  @Prop({ required: true })
  errCondition: boolean

  @Prop({ default: 'This is a required field.' })
  errMsg: string

  @Prop({ required: true })
  id: string

  @Prop({ required: true })
  label: string
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
