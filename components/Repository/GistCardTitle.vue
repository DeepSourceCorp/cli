<template>
  <div class="items-center space-y-1 text-vanilla-400 md:flex md:space-x-4 md:space-y-0">
    <!-- Issue title -->
    <div class="flex items-center space-x-2">
      <z-icon
        v-if="icon"
        :icon="icon"
        size="small"
        :color="iconColor"
        class="flex-shrink-0"
        :class="{ 'motion-safe:animate-spin': spinIcon }"
      />
      <span
        v-if="title"
        class="mr-1 inline overflow-hidden overflow-ellipsis whitespace-pre text-xl font-bold leading-9 text-vanilla-100"
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
            class="inline leading-none hover:bg-ink-200 md:flex"
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
@Component({})
export default class GistCardTitle extends Vue {
  @Prop({ required: true })
  icon: string

  @Prop({ required: true })
  iconColor: string

  @Prop({ required: true })
  title: string

  @Prop({ default: '' })
  id: string

  @Prop({ default: '' })
  link: string

  @Prop({ default: '' })
  vcsCommitUrl: string

  @Prop({ default: '' })
  vcsPrUrl: string

  @Prop({ default: '' })
  vcsPrNumber: string

  @Prop({ default: false })
  spinIcon: boolean
}
</script>
