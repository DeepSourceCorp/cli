<template>
  <div class="p-4 border-b border-ink-200">
    <z-breadcrumb separator="/" class="mb-px text-sm text-vanilla-100">
      <z-breadcrumb-item
        v-for="link in links"
        :key="link.label"
        :class="{ 'cursor-pointer text-vanilla-400': link.route }"
      >
        <nuxt-link v-if="link.route" :to="link.route">{{ link.label }}</nuxt-link>
        <template v-else>{{ link.label }}</template>
      </z-breadcrumb-item>
    </z-breadcrumb>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZBreadcrumb, ZBreadcrumbItem } from '@deepsource/zeal'

export interface ILinks {
  label: string
  route?: string
}

@Component({
  components: {
    ZBreadcrumb,
    ZBreadcrumbItem
  }
})

/**
 * Container component to render breadcrumb items
 */
export default class BreadcrumbContainer extends Vue {
  @Prop({ required: true })
  links!: ILinks[]
}
</script>
