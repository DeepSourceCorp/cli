<template>
  <div
    class="flex flex-col space-y-2"
    :class="{
      'is-group transition-all duration-150': isExpanded & !loading
    }"
  >
    <slot name="collapsed" :toggleItems="toggleItems" :isExpanded="isExpanded"></slot>
    <template v-if="isExpanded && !loading" class="relative">
      <slot name="expanded"></slot>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZLabel } from '@deepsourcelabs/zeal'

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

  get countText(): string {
    const count = this.count - 1

    if (count === 1) {
      // singular
      return `${count} more run on this branch`
    } else if (count > 1 && count <= 30) {
      // plural
      return `${count} more runs on this branch`
    } else if (count > 30) {
      return `30+ runs on this branch`
    } else {
      return ''
    }
  }

  public isExpanded = false

  toggleItems(): void {
    this.isExpanded = !this.isExpanded
    this.$emit('toggled', this.isExpanded)
  }
}
</script>
<style lang="scss">
$color: #23262e;
$ident: 14px;
$left: -($ident);

.is-group {
  .group-heading {
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: 10px;
      left: -16px;
      width: 8px;
      height: 8px;
      background-color: $color;
      border-radius: 100px;
    }
  }
  .is-group-item {
    position: relative;
    &:before {
      content: '';
      position: absolute;
      top: -25px;
      left: $left;
      border-left: 2px solid $color;
      border-bottom: 2px solid $color;
      width: $ident;
      height: calc(50% + 25px);
    }
    &:after {
      position: absolute;
      content: '';
      top: 5px;
      left: $left;
      border-left: 2px solid $color;
      border-top: 0px solid $color;
      width: $ident;
      height: 100%;
    }
    &:last-child:before {
      border-bottom-left-radius: 6px;
    }
    &:last-child:after {
      display: none;
    }
  }
}
</style>
