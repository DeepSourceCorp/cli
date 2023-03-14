<template>
  <span>
    <nuxt-link
      class="inline-flex space-x-1 text-vanilla-400 hover:text-vanilla-100 text-sm items-center cursor-pointer"
      :to="link"
    >
      <z-icon icon="chevron-left" size="small" color="current" />
      <span>{{ title }}</span>
    </nuxt-link>
  </span>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'
@Component({
  components: {
    ZIcon
  }
})
export default class LinkToPrev extends Vue {
  @Prop({ default: '' })
  link!: string
  @Prop({ default: '' })
  title!: string
}
</script>
