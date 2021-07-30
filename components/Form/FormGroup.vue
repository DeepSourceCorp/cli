<template>
  <div>
    <div v-if="label" class="flex items-center space-x-4">
      <h5 class="text-sm uppercase font-medium tracking-wider block whitespace-nowrap">
        {{ label }}
      </h5>
      <div class="flex-grow">
        <z-divider color="ink-200"></z-divider>
      </div>
    </div>
    <div
      class="max-w-2xl"
      :class="{
        'divide-y divide-ink-300': divide,
        [bodyClass]: bodyClass
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZDivider } from '@deepsourcelabs/zeal'

@Component({
  components: { ZDivider }
})
export default class FormGroup extends Vue {
  @Prop({ required: true })
  label: boolean

  @Prop({ default: true })
  divide: boolean

  @Prop({ default: '' })
  bodyClass: string
}
</script>
