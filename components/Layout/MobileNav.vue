<template>
  <div class="flex items-center justify-between w-full p-2">
    <z-button
      id="mobile-menu-toggle"
      icon="menu"
      buttonType="ghost"
      size="small"
      color="vanilla-100"
      @click="triggerExpand"
    />
    <user-menu :isCollapsed="true" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ZButton } from '@deepsource/zeal'

@Component({
  components: {
    ZButton
  }
})
export default class MobileNav extends Vue {
  triggerExpand() {
    this.$root.$emit('ui:show-sidebar-menu')
  }
}
</script>
