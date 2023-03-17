<template>
  <z-menu placement="top">
    <template #trigger="{ toggle }">
      <z-button
        size="x-small"
        icon="more-vertical"
        button-type="ghost"
        icon-color="vanilla-400"
        @click="toggle"
      />
    </template>
    <template #body="{ close }">
      <z-menu-item
        v-if="!$config.onPrem"
        as="nuxt-link"
        to="/discover"
        class="w-full flex items-center"
        @click.native="close"
      >
        <z-icon icon="discover" color="vanilla-300" class="mr-2.5" />
        <span>Discover</span>
      </z-menu-item>
      <z-menu-item
        as="nuxt-link"
        to="/directory"
        class="w-full flex items-center"
        @click.native="close"
      >
        <z-icon icon="book" color="vanilla-300" class="mr-2.5" />
        <span>Directory</span>
      </z-menu-item>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ZMenu, ZMenuItem, ZButton, ZIcon } from '@deepsource/zeal'

/**
 * Extra sub menu shown beside the `Dashboard` link in sidebar
 */
@Component({
  name: 'ExtrasMenu',
  components: { ZMenu, ZMenuItem, ZButton, ZIcon }
})
export default class ExtrasMenu extends Vue {}
</script>
