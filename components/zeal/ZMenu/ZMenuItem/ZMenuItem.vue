<template>
  <component
    v-bind="$attrs"
    :is="as"
    class="z-menu-item flex items-center gap-2 leading-none outline-none focus:outline-none"
    :class="[
      spacing,
      disabled ? 'cursor-not-allowed text-vanilla-400' : 'cursor-pointer hover:bg-ink-200'
    ]"
    v-on="$listeners"
    @click="itemClicked"
  >
    <z-icon v-if="icon" :icon="icon" size="small" :color="computedIconColor" />
    <slot></slot>
  </component>
</template>

<script lang="ts">
import Vue from 'vue'
import ZIcon from '../../ZIcon/ZIcon.vue'

interface ZMenuParentT extends Vue {
  close: () => void
}

export default Vue.extend({
  name: 'ZMenuItem',

  props: {
    as: {
      type: String,
      default: 'div'
    },
    icon: {
      type: String,
      default: undefined
    },
    iconColor: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    closeOnClick: {
      type: Boolean,
      default: true
    },
    spacing: {
      type: String,
      default: 'p-3'
    }
  },
  methods: {
    itemClicked() {
      if (this.closeOnClick) {
        const parent = this.$parent as ZMenuParentT
        parent.close()
      }
    }
  },
  computed: {
    computedIconColor(): string {
      if (this.iconColor) {
        return this.iconColor
      }
      return 'current'
    }
  }
})
</script>
