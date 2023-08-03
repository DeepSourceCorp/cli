<template>
  <li
    :class="draggable ? 'bg-ink-200' : 'ignore-element'"
    class="drag-handler flex cursor-pointer items-center space-x-2 rounded-md border border-slate-400 p-2"
    @click="updateRowCheck"
  >
    <z-icon
      color="vanilla-400"
      icon="drag"
      size="x-small"
      class="m-px flex-shrink-0"
      :class="draggable ? 'drag-handler cursor-move' : 'cursor-not-allowed'"
    />
    <z-icon
      :icon="icon"
      :color="isSelected ? 'vanilla-100' : 'vanilla-400'"
      class="flex-shrink-0"
    />
    <label
      class="flex-grow cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-sm"
      :class="isSelected ? 'text-vanilla-100' : 'text-vanilla-400'"
    >
      {{ toSentenceCase(title) }}
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
import { ModelSync } from 'vue-property-decorator'
import { toSentenceCase } from '~/utils/string'

@Component({
  layout: 'dashboard',
  methods: {
    toSentenceCase
  }
})
export default class CustomizeWidgetsModalRow extends Vue {
  @ModelSync('value', 'input', { type: Array })
  readonly modelValue: string[]

  @Prop({ default: true })
  draggable: boolean

  @Prop({ default: false })
  isSelected: boolean

  @Prop({ required: true })
  widgetName: string

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  icon: string

  updateRowCheck(): void {
    if (this.modelValue.includes(this.widgetName)) {
      this.$emit(
        'input',
        this.modelValue.filter((val) => val !== this.widgetName)
      )
    } else {
      this.$emit('input', [...this.modelValue, this.widgetName])
    }
  }
}
</script>
