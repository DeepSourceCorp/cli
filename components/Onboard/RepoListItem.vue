<template>
  <div
    class="flex items-center px-2 py-2 border-b border-ink-300 cursor-pointer gap-x-2 hover:bg-ink-300 hover:border-0 hover:rounded-md"
    @click="handleClick"
  >
    <z-icon :icon="icon" size="small"></z-icon>
    <div class="flex-1 text-xs sm:text-sm">{{ handleName }}/{{ repoName }}</div>
    <analyzer-logo v-if="analyzer" v-bind="analyzer" />
    <z-icon v-else-if="language" :icon="language"></z-icon>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'
import { Analyzer } from '~/types/types'

@Component({
  components: {
    ZIcon
  }
})
export default class RepoListItem extends Vue {
  @Prop({ default: 'z-lock' })
  icon!: string

  @Prop({ default: '' })
  repoName!: string

  @Prop({ default: '' })
  handleName!: string

  @Prop({ default: '' })
  language!: string

  @Prop({ default: null })
  analyzer!: Analyzer

  public handleClick(event: Event): void {
    this.$emit('click', event)
  }
}
</script>
