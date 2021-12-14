<template>
  <div
    class="flex flex-col space-y-2"
    :class="{
      'is-group pl-2 transition-all duration-150': isExpanded & !loading
    }"
  >
    <!-- Section Title -->
    <slot name="heading">
      <div class="flex text-vanilla-400 text-sm space-x-2 group-heading">
        <!-- Branch Name -->
        <div class="flex items-center">
          <div
            class="
              flex
              items-center
              space-x-2
              py-2
              px-3
              leading-none
              rounded-full
              hover:bg-ink-200
              text-vanilla-200 text-xs
              cursor-pointer
            "
            :class="isExpanded ? 'bg-ink-200' : 'bg-ink-300'"
            @click="toggleItems"
          >
            <span>{{ title }}</span>
          </div>
        </div>
        <!-- Collapsible Component -->
        <div
          v-if="count - 1"
          class="flex items-center space-x-2 cursor-pointer"
          @click="toggleItems"
        >
          <div v-if="loading" class="flex items-center space-x-1 text-xs px-2">
            <z-icon color="juniper" icon="spin-loader" size="x-small" class="animate-spin" />
            <span>Loading</span>
          </div>
          <z-button v-else button-type="ghost" color="vanilla-400" size="x-small">
            <div class="flex items-center space-x-1 text-vanilla-400">
              <span> {{ isExpanded ? 'Collapse' : countText }} </span>
              <z-icon :icon="isExpanded ? 'chevron-up' : 'chevron-down'" size="small" />
            </div>
          </z-button>
        </div>
      </div>
    </slot>
    <!-- Section Card -->
    <template v-if="isExpanded && !loading">
      <slot name="expanded"></slot>
    </template>
    <template v-else>
      <slot name="collapsed"></slot>
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
$color: #4c515d;
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
