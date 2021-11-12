<template>
  <li
    :class="draggable ? 'bg-ink-200' : 'ignore-element'"
    class="flex items-center p-2 space-x-2 border rounded-md border-ink-200"
  >
    <z-icon
      icon="drag"
      :color="draggable ? 'vanilla-200' : 'ink-100'"
      size="x-small"
      class="flex-shrink-0 m-px"
      :class="draggable ? 'drag-handler cursor-move' : 'cursor-not-allowed'"
    />
    <z-icon :icon="icon" color="vanilla-100" class="flex-shrink-0" />
    <label
      class="flex-grow overflow-hidden text-xs whitespace-nowrap overflow-ellipsis vanilla-100"
    >
      {{ title }}
    </label>
    <z-checkbox
      v-model="modelValue"
      size="small"
      class="cursor-pointer py-1.5 font-semibold"
      :value="widgetName"
    />
  </li>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZCheckbox } from '@deepsourcelabs/zeal'
import { ModelSync } from 'vue-property-decorator'

@Component({
  components: {
    ZIcon,
    ZButton,
    ZCheckbox
  },
  layout: 'dashboard'
})
export default class CustomizeWidgetsModalRow extends Vue {
  @ModelSync('value', 'input', { type: Array })
  readonly modelValue: string | number

  @Prop({ default: true })
  draggable: boolean

  @Prop({ required: true })
  widgetName: string

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  icon: string
}
</script>
