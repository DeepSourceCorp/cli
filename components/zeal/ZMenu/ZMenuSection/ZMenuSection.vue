<template>
  <div class="z-menu-section">
    <h6
      v-if="title"
      class="mb-0.5 mt-2 px-3 text-xs font-semibold uppercase tracking-wider text-vanilla-400"
    >
      {{ title }}
    </h6>
    <slot></slot>
    <z-divider v-if="divider" color="ink-100" margin="m-0" />
  </div>
</template>

<script lang="ts">
import ZDivider from '../../ZDivider/ZDivider.vue'
import Vue from 'vue'

interface ZMenuT extends Vue {
  close: () => void
}

export default Vue.extend({
  name: 'ZMenuSection',

  props: {
    title: {
      type: String
    },
    divider: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    close(): void {
      const parent = this.$parent as ZMenuT
      parent.close()
    }
  }
})
</script>
