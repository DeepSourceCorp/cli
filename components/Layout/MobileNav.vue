<template>
  <div class="grid items-center justify-between w-full grid-cols-4">
    <div>
      <z-button
        id="mobile-menu-toggle"
        icon="menu"
        buttonType="ghost"
        size="small"
        color="vanilla-100"
        @click="triggerExpand"
      />
    </div>
    <div class="col-span-2">
      <img
        class="w-auto h-5 mt-0.5 mx-auto"
        src="~/assets/images/logo-wordmark-white.svg"
        alt="DeepSource"
      />
    </div>
    <div class="flex justify-end">
      <user-menu :isCollapsed="true" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ZButton } from '@deepsourcelabs/zeal'

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
