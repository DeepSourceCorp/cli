<template>
  <div
    class="sm:flex text-xs lg:text-lg lg:leading-9 text-vanilla-400 font-normal items-center space-x-4"
  >
    <!-- Issue title -->
    <div class="sm:flex space-x-2 items-center">
      <z-icon
        v-if="icon"
        class="inline md:flex"
        :icon="icon"
        size="small"
        :color="iconColor"
      ></z-icon>
      <span
        v-if="title"
        class="inline sm:inline-block sm:max-w-lg sm:overflow-hidden sm:whitespace-pre text-sm sm:text-base leading-5 font-bold lg:text-xl lg:leading-9 lg:font-bold text-vanilla-100 sm:overflow-ellipsis mr-1"
        v-html="title.trim()"
      >
      </span>
    </div>
    <!-- Issue ID -->
    <template v-if="id">
      <a
        v-if="vcsCommitUrl"
        :href="vcsCommitUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline md:flex"
        >@{{ id }}</a
      >
      <span v-else target="_blank" rel="noopener noreferrer" class="inline md:flex">@{{ id }}</span>
    </template>
    <template v-if="vcsPrUrl && vcsPrNumber">
      <a :href="vcsPrUrl" target="_blank" rel="noopener noreferrer">
        <z-tag
          target="_blank"
          rel="noopener noreferrer"
          class="inline md:flex hover:bg-ink-200 leading-none"
          spacing="p-2"
        >
          {{ $route.params.provider == 'gl' ? 'MR' : 'PR' }}{{ vcsPrNumber }}
        </z-tag>
      </a>
    </template>
    <slot></slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZTag } from '@deepsourcelabs/zeal'
@Component({
  components: {
    ZIcon,
    ZTag
  }
})
export default class GistCardTitle extends Vue {
  @Prop({ default: '' })
  icon!: string

  @Prop({ default: '' })
  iconColor!: string

  @Prop({ default: '' })
  link!: string

  @Prop({ default: '' })
  vcsCommitUrl!: string

  @Prop({ default: '' })
  vcsPrUrl!: string

  @Prop({ default: '' })
  vcsPrNumber!: string

  @Prop({ default: '' })
  title!: string

  @Prop({ default: '' })
  id!: string
}
</script>
