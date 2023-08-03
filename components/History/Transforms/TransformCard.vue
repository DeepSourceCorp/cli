<template>
  <base-card :to="getRoute(runId)" class="group">
    <template #title>
      <z-icon
        v-tooltip="tooltipText"
        :icon="icon"
        size="small"
        :color="iconColor"
        class="flex-shrink-0"
        :class="{ 'motion-safe:animate-spin': isPending }"
      />
      <h3
        class="cursor-pointer overflow-hidden overflow-ellipsis whitespace-nowrap text-vanilla-100"
      >
        {{ branchName }}
      </h3>
      <span class="inline flex-shrink-0 text-sm font-normal text-vanilla-400 md:flex"
        >@{{ commitOid.slice(0, 7) }}</span
      >
    </template>
    <template #description>
      <div class="ml-6 mt-2 space-y-1 md:flex md:flex-wrap md:items-center md:gap-x-4 md:space-y-0">
        <div v-if="!isPending" class="flex items-center space-x-1.5">
          <z-icon icon="clock" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400 sm:text-sm">Transformed {{ createdString }}</span>
        </div>
        <div v-else class="flex items-center space-x-1.5">
          <z-icon icon="clock" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400 sm:text-sm">Transform in progress</span>
        </div>
        <!-- Issue type -->
        <div class="hidden items-center space-x-1.5 md:flex">
          <z-icon icon="git-commit" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400 sm:text-sm">{{ gitCompareDisplay }}</span>
        </div>
        <!-- Created -->
        <div v-if="!isPending" class="hidden items-center space-x-1.5 md:flex">
          <z-icon icon="clock" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400 sm:text-sm">
            {{ statusText }} {{ finishedString }}
          </span>
        </div>
        <!-- files transformed -->
        <div v-if="changedFilesCount !== null" class="flex items-center space-x-1.5 md:hidden">
          <z-icon icon="code" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400"> {{ changedFilesCount }} files transformed </span>
        </div>
      </div>
      <div class="ml-4 mt-2.5 flex items-center space-x-2">
        <z-tag
          v-for="tool in tools"
          :key="tool.shortcode"
          bg-color="ink-300 group-hover:bg-ink-200"
          spacing="p-1 px-2"
        >
          <img :src="tool.logo_path" alt="tool.name" class="h-2.5 w-auto" />
          <span class="text-xs text-vanilla-400">{{ tool.name }}</span>
        </z-tag>
      </div>
    </template>
    <template #info>
      <div
        v-if="changedFilesCount !== null"
        class="flex h-full items-center justify-around space-x-2"
      >
        <div class="flex flex-col items-center">
          <div
            class="text-2xl font-medium"
            :class="{
              'text-juniper': changedFilesCount > 0,
              'text-vanilla-400': changedFilesCount === 0
            }"
          >
            {{ changedFilesCount }}
          </div>
          <div class="text-xs text-vanilla-400">files transformed</div>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { BaseCard } from '../'

import { fromNow, formatSeconds } from '@/utils/date'
import { TransformerRunStatus } from '~/types/types'

@Component({
  components: {
    BaseCard
  }
})
export default class TransformCard extends Vue {
  @Prop({ default: 'PASS' })
  status: string

  @Prop({ default: '' })
  branchName: string

  @Prop({ default: '' })
  runId: string

  @Prop({ default: '' })
  createdAt!: string

  @Prop({ default: '' })
  finishedIn!: number

  @Prop({ default: '' })
  gitCompareDisplay!: string

  @Prop({ default: '' })
  commitOid!: string

  @Prop({ default: '' })
  changedFilesCount!: string

  @Prop({ default: [] })
  tools: Array<Record<string, string>>

  get icon(): string {
    const types: Record<string, string> = {
      [TransformerRunStatus.Pass]: 'check',
      [TransformerRunStatus.Fail]: 'x',
      [TransformerRunStatus.Stal]: 'stale',
      [TransformerRunStatus.Timo]: 'clock',
      [TransformerRunStatus.Pend]: 'spin-loader',
      [TransformerRunStatus.Empt]: 'minus-circle'
    }
    return types[this.status || TransformerRunStatus.Pass]
  }

  get iconColor(): string {
    const types: Record<string, string> = {
      [TransformerRunStatus.Pass]: 'juniper',
      [TransformerRunStatus.Fail]: 'cherry',
      [TransformerRunStatus.Stal]: 'vanilla-300',
      [TransformerRunStatus.Timo]: 'honey',
      [TransformerRunStatus.Pend]: 'vanilla-100',
      [TransformerRunStatus.Empt]: 'honey'
    }
    return types[this.status || TransformerRunStatus.Pass]
  }

  get tooltipText(): string {
    const types: Record<string, string> = {
      [TransformerRunStatus.Pass]: 'Transform completed',
      [TransformerRunStatus.Fail]: 'Transform failed',
      [TransformerRunStatus.Stal]: 'Transform stale',
      [TransformerRunStatus.Timo]: 'Transform timed out',
      [TransformerRunStatus.Pend]: 'Transform in progress',
      [TransformerRunStatus.Empt]: 'Transform empty'
    }
    return types[this.status || 'PASS']
  }

  get statusText(): string {
    const types: Record<string, string> = {
      [TransformerRunStatus.Pass]: 'Finished in',
      [TransformerRunStatus.Fail]: 'Failed after',
      [TransformerRunStatus.Stal]: 'Finished in',
      [TransformerRunStatus.Timo]: 'Timed out after',
      [TransformerRunStatus.Pend]: 'Running since',
      [TransformerRunStatus.Empt]: 'Returned empty after'
    }
    return types[this.status || 'PASS']
  }

  get isPending(): boolean {
    return this.status === TransformerRunStatus.Pend
  }

  getRoute(candidate: string): string {
    return this.$generateRoute(['transform', candidate])
  }

  get commitHash(): string {
    return this.commitOid.slice(0, 7)
  }

  get createdString(): string {
    // return '2mins'
    return fromNow(this.createdAt)
  }

  get finishedString(): string {
    return formatSeconds(this.finishedIn)
  }
}
</script>
