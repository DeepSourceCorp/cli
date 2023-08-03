<template>
  <div
    class="flex cursor-pointer items-center gap-x-2 border-b border-slate-400 px-2 py-2 hover:rounded-md hover:border-0 hover:bg-ink-300"
    @click="handleClick"
  >
    <z-icon :icon="icon" size="small" />
    <div class="flex-1 text-xs sm:text-sm">{{ handleName }}/{{ repoName }}</div>
    <analyzer-logo v-if="analyzer" v-bind="analyzer" />
    <z-icon v-else-if="language" :icon="language" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { Analyzer } from '~/types/types'

@Component({})
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
