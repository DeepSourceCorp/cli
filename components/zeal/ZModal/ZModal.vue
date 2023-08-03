<template>
  <z-dialog-generic class="z-modal-backdrop" @onClose="closeModal">
    <template #default="{ close }">
      <div
        class="z-modal w-full"
        :class="{
          'sm:w-96': width === 'narrow',
          'sm:w-102': width === 'base',
          'max-w-2xl sm:w-120': width === 'wide'
        }"
        @click.stop
      >
        <div
          class="flex items-center justify-between space-x-2 border-ink-200 p-4"
          :class="{ 'border-b': showHeaderBorder }"
        >
          <slot name="title">
            <span class="text-base text-vanilla-100">{{ title }}</span>
          </slot>
          <!--This icon is too small, we can increase it a point-->
          <z-button
            icon="x"
            button-type="secondary"
            size="x-small"
            class="z-modal-close-x"
            @click="close"
          />
        </div>
        <slot :close="close">
          <div class="min-h-20 p-4 text-sm text-vanilla-100">
            {{ body }}
          </div>
        </slot>
        <slot name="footer" :close="close">
          <div
            v-if="primaryActionLabel"
            class="space-x-4 border-ink-200 p-4 text-right text-vanilla-100"
          >
            <z-button
              :icon="primaryActionIcon"
              class="modal-primary-action"
              :button-type="primaryActionType"
              size="small"
              @click="primaryAction(close)"
              >{{ primaryActionLabel }}</z-button
            >
          </div>
        </slot>
      </div>
    </template>
  </z-dialog-generic>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ZModal',
  props: {
    title: {
      type: String,
      default: undefined
    },
    body: {
      type: String,
      default: undefined
    },
    width: {
      type: String,
      default: 'base',
      validator: function (value: string): boolean {
        return ['narrow', 'base', 'wide'].includes(value)
      }
    },
    closeAfterPrimaryAction: {
      type: Boolean,
      default: true
    },
    primaryActionLabel: {
      type: String,
      default: undefined
    },
    primaryActionIcon: {
      type: String,
      default: undefined
    },
    primaryActionType: {
      type: String,
      default: 'primary'
    },
    showHeaderBorder: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    closeModal(): void {
      this.$emit('onClose')
    },
    primaryAction(close: () => void): void {
      this.$emit('primaryAction')
      if (this.closeAfterPrimaryAction) {
        close()
      }
    }
  }
})
</script>
