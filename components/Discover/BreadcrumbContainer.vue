<template>
  <div class="p-4 border-b border-ink-200">
    <z-breadcrumb separator="/" class="mb-px text-sm text-vanilla-100">
      <z-breadcrumb-item class="cursor-pointer text-vanilla-400">
        <nuxt-link to="/discover">Discover</nuxt-link>
      </z-breadcrumb-item>
      <z-breadcrumb-item>{{ currentItem }}</z-breadcrumb-item>
    </z-breadcrumb>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZBreadcrumb, ZBreadcrumbItem } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZBreadcrumb,
    ZBreadcrumbItem
  }
})
export default class BreadcrumbContainer extends Vue {
  @Prop({ required: true })
  currentItem!: string
}
</script>
