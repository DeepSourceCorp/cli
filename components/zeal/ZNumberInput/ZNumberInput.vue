<template>
  <div class="flex items-center rounded-md border border-ink-100 focus-within:border-vanilla-400">
    <z-button
      size="x-small"
      icon="minus"
      button-type="secondary"
      :disabled="localVal <= minNumber"
      class="flex-shrink-0"
      @click="updateNumber($event, -1)"
    />
    <input
      v-model="localVal"
      v-bind="$attrs"
      type="number"
      :min="minNumber"
      :max="maxNumber"
      :show-border="false"
      :placeholder="placeholder"
      class="hide-input-spinners min-w-0 flex-grow bg-ink-400 text-center outline-none"
      v-on="inputListeners"
    />
    <z-button
      size="x-small"
      icon="plus"
      button-type="secondary"
      :disabled="localVal >= maxNumber"
      class="flex-shrink-0"
      @click="updateNumber($event, 1)"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ZButton from '../ZButton/ZButton.vue'

export default Vue.extend({
  name: 'ZNumberInput',
  components: { ZButton },
  props: {
    value: { type: [Number, String], default: NaN },
    min: { type: [Number, String], default: NaN },
    max: { type: [Number, String], default: NaN },
    step: { type: Number, default: 1 },
    jump: { type: Number, default: 5 },
    placeholder: { type: String, default: 'Enter a number' }
  },
  data() {
    return {
      localVal: Number(this.value)
    }
  },
  computed: {
    minNumber(): number {
      return Number(this.min)
    },
    maxNumber(): number {
      return Number(this.max)
    },
    localValNumber(): number {
      return Number(this.localVal)
    },
    inputListeners(): object {
      return Object.assign({}, this.$listeners, {
        input: ({ target }: InputEvent) => {
          if (target) {
            const a = this.minMaxNum((target as HTMLInputElement).valueAsNumber)
            this.localVal = a
            this.$emit('input', this.localValNumber)
          }
        }
      })
    }
  },
  methods: {
    updateNumber(e: MouseEvent, modifier: number): void {
      if (e.shiftKey) this.localVal = this.minMaxNum(this.localValNumber + this.jump * modifier)
      else this.localVal = this.minMaxNum(this.localValNumber + this.step * modifier)
      this.$emit('input', this.localValNumber)
    },
    minMaxNum(val: number): number {
      if (!isNaN(this.minNumber) && !isNaN(this.maxNumber))
        return Math.min(Math.max(val, this.minNumber), this.maxNumber)
      else if (!isNaN(this.minNumber)) return Math.max(val, this.minNumber)
      else if (!isNaN(this.maxNumber)) return Math.min(val, this.maxNumber)
      return val
    }
  }
})
</script>
