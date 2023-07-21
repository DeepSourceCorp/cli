<template>
  <div
    :class="{
      'nested-group transition-all duration-150': isExpanded & !loading
    }"
    class="flex flex-col space-y-2"
  >
    <slot name="collapsed" :toggle-items="toggleItems" :is-expanded="isExpanded"></slot>
    <template v-if="isExpanded && !loading">
      <slot name="expanded"></slot>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZLabel } from '@deepsource/zeal'

@Component({
  components: {
    ZIcon,
    ZButton,
    ZLabel
  }
})
export default class BranchList extends Vue {
  @Prop({ default: 1 })
  count: number

  @Prop({ default: '' })
  title: number

  @Prop({ default: false })
  loading: boolean

  @Prop({ default: false })
  isExpanded: boolean

  get countText(): string {
    const count = this.count - 1

    if (count === 1) {
      // singular
      return `${count} more run on this branch`
    } else if (count > 1 && count <= 30) {
      // plural
      return `${count} more runs on this branch`
    } else if (count > 30) {
      return '30+ runs on this branch'
    } else {
      return ''
    }
  }

  toggleItems(): void {
    this.$emit('toggled', !this.isExpanded)
  }
}
</script>
