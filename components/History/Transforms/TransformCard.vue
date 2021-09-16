<template>
  <base-card :to="getRoute(runId)" class="group">
    <template slot="title">
      <z-icon
        v-tooltip="tooltipText"
        :icon="icon"
        size="small"
        class="flex-shrink-0"
        :color="iconColor"
      ></z-icon>
      <h3
        class="text-vanilla-100 cursor-pointer whitespace-nowrap overflow-ellipsis overflow-hidden"
      >
        {{ branchName }}
      </h3>
      <span class="text-sm text-vanilla-400 font-normal inline md:flex flex-shrink-0"
        >@{{ commitOid.slice(0, 7) }}</span
      >
    </template>
    <template slot="description">
      <div class="items-center space-y-1 md:space-y-0 md:flex md:space-x-4 mt-2 ml-6">
        <div v-if="!isPending" class="flex items-center space-x-1.5">
          <z-icon icon="clock" size="x-small" color="vanilla-400"></z-icon>
          <span class="text-sm sm:text-sm text-vanilla-400">Transformed {{ createdString }}</span>
        </div>
        <div v-else class="flex items-center space-x-1.5">
          <z-icon icon="clock" size="x-small" color="vanilla-400"></z-icon>
          <span class="text-sm sm:text-sm text-vanilla-400"
            >Transform in progress {{ createdString }}</span
          >
        </div>
        <!-- Issue type -->
        <div class="items-center hidden space-x-1.5 md:flex">
          <z-icon icon="git-commit" size="x-small" color="vanilla-400"></z-icon>
          <span class="text-sm sm:text-sm text-vanilla-400">{{ gitCompareDisplay }}</span>
        </div>
        <!-- Created -->
        <div v-if="!isPending" class="items-center hidden space-x-1.5 md:flex">
          <z-icon icon="clock" size="x-small" color="vanilla-400"></z-icon>
          <span class="text-sm sm:text-sm text-vanilla-400">
            {{ statusText }} {{ finishedString }}
          </span>
        </div>
        <!-- files transformed -->
        <div v-if="changedFilesCount !== null" class="items-center flex space-x-1.5 md:hidden">
          <z-icon icon="code" size="x-small" color="vanilla-400"></z-icon>
          <span class="text-sm text-vanilla-400"> {{ changedFilesCount }} files transformed </span>
        </div>
      </div>
      <div class="items-center flex space-x-2 mt-2.5 ml-4">
        <z-tag
          v-for="tool in tools"
          :key="tool.shortcode"
          bgColor="ink-300 group-hover:bg-ink-200"
          spacing="p-1 px-2"
        >
          <img :src="tool.logo_path" alt="tool.name" class="h-2.5 w-auto" />
          <span class="text-xs text-vanilla-400">{{ tool.name }}</span>
        </z-tag>
      </div>
    </template>
    <template slot="info">
      <div
        v-if="changedFilesCount !== null"
        class="flex justify-around items-center space-x-2 h-full"
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
import { ZIcon, ZTag } from '@deepsourcelabs/zeal'
import { BaseCard } from '../'

import { fromNow, formatSeconds } from '@/utils/date'
import { TransformerRunStatus } from '~/types/types'

@Component({
  components: {
    BaseCard,
    ZIcon,
    ZTag
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
      [TransformerRunStatus.Pend]: 'refresh-cw',
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
