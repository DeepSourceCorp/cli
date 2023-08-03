<template>
  <div
    :tabindex="tabIndex"
    class="custom-select relative h-full w-full text-left leading-8 outline-none"
    :class="{ 'is-disabled': disabled, 'is-readonly': readOnly }"
    @blur.stop="!disabled && !readOnly && blurEvent()"
  >
    <div
      class="selected flex h-full items-center justify-between space-x-2 border border-solid"
      :class="[
        (open && 'border-vanilla-400') || borderClass,
        spacing,
        backgroundClass,
        borderRadius,
        getTextColor,
        getCursorType
      ]"
      @[canClick]="open = !open"
    >
      <slot name="icon"></slot>
      <div
        class="flex h-full flex-grow cursor-pointer items-center outline-none"
        :class="[
          getTextSize,
          getCursorType,
          { 'text-vanilla-400 opacity-70': selectedValue === null },
          { truncate }
        ]"
      >
        <template v-if="selectedLabel || selectedValue">
          {{ selectedLabel || selectedValue }}
        </template>
        <template v-else>
          {{ placeholder }}
        </template>
      </div>
      <button
        v-if="selectedValue && clearable"
        class="flex items-center justify-between"
        @click.stop="clearSelected"
      >
        <z-icon icon="x" size="small" :color="getIconColor" />
      </button>
      <span v-else>
        <z-icon
          icon="chevron-down"
          size="small"
          class="transform transition-all duration-300"
          :color="getIconColor"
          :class="(open && 'rotate-180') || 'rotate-0'"
        />
      </span>
    </div>
    <!-- prettier-ignore -->
    <div
      class="absolute left-0 right-0 z-10 mt-1 overflow-y-auto transition-all duration-300 border border-solid rounded-md options shadow-black border-ink-100 text-vanilla-300 bg-ink-300"
      :class="[ { 'hidden' : !open  }, maxHeight  ]"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

interface ZOptionPropsT extends Vue {
  value: string | number | null
  label: string
}

export default Vue.extend({
  name: 'ZSelect',
  props: {
    selected: {
      type: [String, Number],
      default: null
    },
    tabIndex: {
      type: Number,
      required: false,
      default: 0
    },
    placeholder: {
      type: String,
      default: 'Select an Option'
    },
    clearable: {
      type: Boolean,
      default: false
    },
    spacing: {
      type: String,
      default: 'px-2 py-3'
    },
    borderClass: {
      type: String,
      default: 'border-ink-200'
    },
    borderRadius: {
      type: String,
      default: 'rounded-md'
    },
    backgroundClass: {
      type: String,
      default: 'bg-transparent'
    },
    textSize: {
      type: String,
      default: 'text-xs'
    },
    disabled: {
      default: false,
      type: Boolean
    },
    readOnly: {
      default: false,
      type: Boolean
    },
    truncate: {
      default: false,
      type: Boolean
    },
    maxHeight: {
      type: String,
      default: 'max-h-64',
      validator: (value: string) => value.startsWith('max-h')
    }
  },

  model: {
    prop: 'selected',
    event: 'change'
  },

  data() {
    return {
      open: false,
      options: [] as Array<Vue>
    }
  },

  computed: {
    canClick(): string {
      if (!this.disabled && !this.readOnly) return 'click'
      return ''
    },
    getTextSize(): string {
      const validTextSizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl']
      if (validTextSizes.includes(this.textSize)) {
        return this.textSize
      }
      return 'text-xs'
    },
    getTextColor(): string {
      if (this.disabled) return 'text-slate'
      if (this.readOnly) return 'text-vanilla-400'
      return 'text-vanilla-300'
    },
    getCursorType(): string {
      if (this.disabled || this.readOnly) return 'cursor-not-allowed'
      return 'cursor-pointer'
    },
    getIconColor(): string {
      if (this.disabled) return 'slate'
      return 'vanilla-400'
    },
    selectedLabel(): string | null {
      return this.selectedOption?.label ?? null
    },
    selectedOption(): ZOptionPropsT | null {
      if (this.selected) {
        const selectedOption = this.options
          .map((child) => {
            return child.$options.propsData as ZOptionPropsT
          })
          .find((childProp) => {
            return childProp.value === this.selected
          })

        if (selectedOption) {
          return selectedOption
        }
      }

      return null
    },
    selectedValue(): string | number | null {
      return this.selectedOption?.value ?? null
    }
  },

  mounted(): void {
    this.options = this.$children.filter((child) => child.$options.name === 'ZOption')
  },

  methods: {
    blurEvent(): void {
      this.open = false
    },
    clearSelected(): void {
      this.$emit('change', null)
    },
    onChange(val: string): void {
      this.$emit('change', val)
    }
  }
})
</script>
