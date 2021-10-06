<template>
  <transition
    enter-active-class="transform-gpu ease-out duration-200 transition"
    enter-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-full"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transform-gpu ease-in duration-100"
    leave-class="opacity-100 sm:translate-x-0 translate-y-0"
    leave-to-class="opacity-0 sm:translate-x-1 translate-y-1 sm:translate-y-0"
  >
    <div
      v-if="active"
      :class="classToastAll"
      class="max-w-sm w-full shadow-lg rounded-lg pointer-events-auto mb-4 overflow-hidden"
    >
      <div :class="classToastAll" class="rounded-lg shadow-xs overflow-hidden z-100">
        <div
          class="p-2 flex items-start leading-none"
          :class="{
            'bg-cherry': type === 'danger'
          }"
        >
          <div class="flex-shrink-0">
            <div v-if="type === 'success'" class="rounded-full p-1">
              <z-icon icon="check-circle" size="small" color="juniper"></z-icon>
            </div>
            <div v-else-if="type === 'danger'" class="rounded-full p-1">
              <z-icon icon="alert-circle" size="small" color="vanilla-100"></z-icon>
            </div>
            <div v-else-if="type === 'info'" class="rounded-full p-1">
              <z-icon icon="alert-circle" size="small" color="vanilla-400"></z-icon>
            </div>
          </div>
          <div class="w-0 flex-1 px-2 mt-0.5">
            <slot>
              <p
                v-if="message"
                :class="message"
                class="text-sm leading-5 font-medium text-vanilla-100"
                v-html="message"
              ></p>
            </slot>
          </div>
          <div class="flex-shrink-0 flex">
            <button
              v-if="primary.label"
              class="inline-flex bg-ink-400 hover:bg-ink-500 p-2 rounded-sm text-sm cursor-pointer text-vanilla-100 transition ease-in-out duration-150 focus:outline-none"
              @click="primaryAction()"
            >
              {{ primary.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'

interface PrimaryAction {
  label: string
  action: Function
}

@Component({
  components: {
    ZIcon
  }
})
export default class Toast extends Vue {
  @Prop({ default: '' })
  message!: string

  @Prop({ default: '' })
  type!: string

  @Prop({ default: true })
  progress!: boolean

  @Prop()
  icon!: string

  @Prop({ default: 2 })
  timeout!: number

  @Prop({ default: true })
  autoClose!: boolean

  @Prop({ default: 'bg-ink-200' })
  classToast!: string

  @Prop({ default: 'text-vanilla-100' })
  classTitle!: string

  @Prop()
  classMessage!: string

  @Prop({})
  classTimeout!: string

  @Prop({ default: () => {} })
  defaults!: object

  @Prop({
    default: () => ({ label: '', action: () => {} })
  })
  primary!: PrimaryAction

  public active = false
  public interval: NodeJS.Timeout
  public timeLeft = 0
  public speed = 100

  mounted(): void {
    this.active = true
    if (this.timeout > 0 && this.autoClose) {
      this.timeLeft = this.timeout * 1000
      setTimeout(this.destroy, this.timeLeft)
    }
  }

  get classToastAll(): Array<string> {
    if (this.classToast) return [this.classToast]
    return []
  }

  public removeElement(el: Element): void {
    if (el) {
      if (typeof el.remove !== 'undefined') el.remove()
      else el.parentNode?.removeChild(el)
    }
  }

  public destroy(): void {
    this.active = false
    setTimeout(() => {
      this.$destroy()
      this.removeElement(this.$el)
    }, 1000)
    this.$emit('destroy')
  }

  public primaryAction() {
    this.destroy()
    this.primary.action()
  }
}
</script>
