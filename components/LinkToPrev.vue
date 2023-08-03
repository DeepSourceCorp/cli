<template>
  <span>
    <nuxt-link
      class="inline-flex cursor-pointer items-center space-x-1 text-sm text-vanilla-400 hover:text-vanilla-100"
      :to="link"
    >
      <z-icon icon="chevron-left" size="small" color="current" />
      <span>{{ title }}</span>
    </nuxt-link>
  </span>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
@Component({})
export default class LinkToPrev extends Vue {
  @Prop({ default: '' })
  link!: string
  @Prop({ default: '' })
  title!: string
}
</script>
