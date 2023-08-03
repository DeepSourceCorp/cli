<template>
  <z-menu :width="width" :direction="direction" @menu-toggle="open = !open">
    <template #trigger="{ toggle }">
      <slot name="trigger" :toggle="toggle">
        <button
          v-tooltip="{ content: tooltipCopy, delay: { show: 200, hide: 100 }, classes: 'w-64' }"
          class="flex cursor-pointer items-center gap-x-1 rounded-full bg-ink-200 focus:outline-none"
          :class="pillPadding"
          @click="toggle"
        >
          <span
            v-if="badgeType(currentPriority)"
            class="rounded-full"
            :class="[badgeType(currentPriority), ellipseSize]"
          ></span>
          <!-- Min. height & width allowed for z-icon are h-3 & w-3, but the badge circle
          has w-2 & h-2, messing with alignment. Hence -ve margins needed -->
          <z-icon
            v-else-if="currentPriority === 'noop'"
            icon="ellipsis-small"
            :size="iconSize"
            class="-mx-0.5"
          />
          <span
            class="text-vanilla-100"
            :class="[
              labelFontSize,
              {
                'min-w-20': currentPriority === 'noop' && size !== 'small',
                'font-medium uppercase tracking-wide': currentPriority
              }
            ]"
          >
            {{ priorityLabel }}
          </span>
          <z-icon
            :size="iconSize"
            icon="chevron-down"
            class="-ml-0.5 transform transition-all duration-300"
            :class="(open && 'rotate-180') || 'rotate-0'"
          />
        </button>
      </slot>
    </template>

    <template #body>
      <z-menu-section :title="menuTitle" :divider="showFooter">
        <z-menu-item
          v-for="option in priorityOptions"
          :key="option.value"
          :class="{
            'bg-ink-200': currentPriority === option.value
          }"
          @click="changePriority(option.value)"
        >
          <span
            v-if="badgeType(option.value)"
            class="h-2 w-2 rounded-full"
            :class="badgeType(option.value)"
          ></span>
          <!-- Min. height & width allowed for z-icon are h-3 & w-3, but the badge circle
          has w-2 & h-2, messing with alignment. Hence -ve margins needed -->
          <z-icon v-else icon="ellipsis-small" size="x-small" class="-mx-0.5" />
          <span
            class="text-xxs font-medium tracking-wide"
            :class="currentPriority === option.value ? 'text-vanilla-200' : 'text-vanilla-400'"
            >{{ option.label }}</span
          >
        </z-menu-item>
      </z-menu-section>
      <z-menu-section v-if="showFooter" :divider="false">
        <z-menu-item
          :disabled="true"
          class="items-stretch py-2 leading-snug"
          style="cursor: default"
        >
          <z-icon icon="info" size="x-small" />
          <span class="-my-px -ml-px text-xxs text-vanilla-400">
            Priority will be updated in {{ prioritySourceVerbose }}.</span
          >
        </z-menu-item>
      </z-menu-section>
    </template>
  </z-menu>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import {
  IssuePriorityLevelVerbose,
  IssuePriorityTypes,
  IssuePriorityTypesVerbose
} from '~/types/issuePriorityTypes'
import { IssuePriorityLevel } from '~/types/types'

/**
 * Component to select priority level for an issue.
 */
@Component({
  name: 'PriorityTypeSelect'
})
export default class PriorityTypeSelect extends Vue {
  @Prop({ default: '', required: true })
  priority!: string

  @Prop({ default: '' })
  menuTitle: string

  @Prop({ default: false })
  showFooter: boolean

  @Prop({ default: 'small' })
  size: string

  @Prop({ default: 'x-small' })
  width: string

  @Prop({ default: 'right' })
  direction: string

  @Prop({ default: false })
  verboseTitle: boolean

  @Prop({ default: IssuePriorityLevel.Repository })
  source: IssuePriorityLevel

  @Prop({ default: false })
  showTooltip: boolean

  public open = false
  public currentPriority = this.priority

  /**
   * Method to update current priority
   * and emit the priority-changed event
   *
   * @param {string} value
   * @returns {void}
   */
  changePriority(value: string): void {
    this.currentPriority = value
    this.$emit('priority-changed', value)
  }

  /**
   * Method to get badge color based on priority
   *
   * @param {string} priority
   * @returns string
   */
  badgeType(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-cherry'
      case 'medium':
        return 'bg-honey'
      case 'low':
        return 'bg-vanilla-400'
      default:
        return ''
    }
  }

  get priorityLabel() {
    if (this.verboseTitle) {
      switch (this.currentPriority) {
        case 'high':
          return IssuePriorityTypesVerbose.HIGH
        case 'medium':
          return IssuePriorityTypesVerbose.MEDIUM
        case 'low':
          return IssuePriorityTypesVerbose.LOW
        case 'noop':
          return IssuePriorityTypesVerbose.NOOP
        default:
          return ''
      }
    } else {
      switch (this.currentPriority) {
        case 'high':
          return IssuePriorityTypes.HIGH
        case 'medium':
          return IssuePriorityTypes.MEDIUM
        case 'low':
          return IssuePriorityTypes.LOW
        case 'noop':
          return IssuePriorityTypes.NOOP
        default:
          return IssuePriorityTypes.SET_PRIORITY
      }
    }
  }

  get priorityOptions() {
    return [
      {
        value: 'noop',
        label: 'NO PRIORITY'
      },
      {
        value: 'high',
        label: 'HIGH'
      },
      {
        value: 'medium',
        label: 'MEDIUM'
      },
      {
        value: 'low',
        label: 'LOW'
      }
    ]
  }

  get pillPadding() {
    switch (this.size) {
      case 'small':
        return 'py-1 pl-1.5 pr-1'
      case 'large':
        return 'pl-2 pr-1.5 py-1.5'
      default:
        return 'py-1 pl-1.5 pr-1'
    }
  }

  get ellipseSize() {
    switch (this.size) {
      case 'small':
        return 'h-2 w-2'
      case 'large':
        return 'h-2.5 w-2.5'
      default:
        return 'h-2 w-2'
    }
  }

  get labelFontSize() {
    if (!this.currentPriority) {
      return 'text-xs'
    }
    switch (this.size) {
      case 'small':
        return 'text-xxs'
      case 'large':
        return 'text-xs'
      default:
        return 'text-xxs'
    }
  }

  get iconSize() {
    switch (this.size) {
      case 'small':
        return 'x-small'
      case 'large':
        return 'small'
      default:
        return 'x-small'
    }
  }

  get prioritySourceVerbose(): string {
    return IssuePriorityLevelVerbose[this.source]
  }

  get tooltipCopy(): string {
    if (!this.showTooltip) {
      return ''
    }

    return `This issue is marked as ${this.priority} priority in ${this.prioritySourceVerbose}.`
  }
}
</script>
