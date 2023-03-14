<template>
  <div>
    <div v-if="label" class="flex items-center space-x-4">
      <h5 class="text-sm uppercase font-medium tracking-wider block whitespace-nowrap">
        {{ label }}
      </h5>
      <div class="flex-grow">
        <z-divider color="ink-200" />
      </div>
    </div>
    <div :class="[bodyWidthClass, bodyClass, divide ? 'divide-y divide-ink-300' : '']">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZDivider } from '@deepsource/zeal'

@Component({
  components: { ZDivider }
})
export default class FormGroup extends Vue {
  @Prop({})
  label: boolean

  @Prop({ default: true })
  divide: boolean

  @Prop({ default: '' })
  bodyClass: string

  @Prop({ default: 'max-w-2xl' })
  bodyWidthClass: string
}
</script>
