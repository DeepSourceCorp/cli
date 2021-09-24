<template>
  <div class="items-center space-y-1 md:flex md:space-y-0 md:space-x-4 text-vanilla-400">
    <!-- Issue title -->
    <div class="flex items-center space-x-2">
      <z-icon
        v-if="icon"
        class="flex-shrink-0"
        :icon="icon"
        size="small"
        :color="iconColor"
      ></z-icon>
      <span
        v-if="title"
        class="inline mr-1 overflow-hidden text-xl font-bold leading-9 whitespace-pre text-vanilla-100 overflow-ellipsis"
        v-html="title.trim()"
      >
      </span>
    </div>
    <div class="flex items-center space-x-2">
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
        <span v-else target="_blank" rel="noopener noreferrer" class="inline md:flex">
          @{{ id }}
        </span>
      </template>
      <template v-if="vcsPrUrl && vcsPrNumber">
        <a :href="vcsPrUrl" target="_blank" rel="noopener noreferrer">
          <z-tag
            target="_blank"
            rel="noopener noreferrer"
            class="inline leading-none md:flex hover:bg-ink-200"
            spacing="p-2"
          >
            {{ $route.params.provider == 'gl' ? 'MR' : 'PR' }}{{ vcsPrNumber }}
          </z-tag>
        </a>
      </template>
    </div>
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
