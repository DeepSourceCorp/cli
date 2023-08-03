<template>
  <transition
    enter-active-class="transition duration-200 ease-out transform-gpu"
    enter-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-full"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="duration-100 ease-in transform-gpu"
    leave-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-to-class="translate-y-1 opacity-0 sm:translate-x-1 sm:translate-y-0"
  >
    <div
      v-if="active"
      :class="classToastAll"
      class="pointer-events-auto mb-4 w-full max-w-sm overflow-hidden rounded-lg shadow-lg"
    >
      <div :class="classToastAll" class="z-100 overflow-hidden rounded-lg shadow-xs">
        <div
          class="flex items-center p-2 leading-none"
          :class="{
            'bg-cherry': type === 'danger'
          }"
        >
          <div class="flex-shrink-0">
            <div v-if="type === 'success'" class="rounded-full p-1">
              <z-icon icon="check-circle" size="small" color="juniper" />
            </div>
            <div v-else-if="type === 'danger'" class="rounded-full p-1">
              <z-icon icon="alert-circle" size="small" color="vanilla-100" />
            </div>
            <div v-else-if="type === 'info'" class="rounded-full p-1">
              <z-icon icon="alert-circle" size="small" color="vanilla-400" />
            </div>
          </div>
          <div class="mt-0.5 w-0 flex-1 px-2">
            <slot>
              <p
                v-if="message"
                :class="message"
                class="text-sm font-medium leading-5 text-vanilla-100"
                v-html="message"
              ></p>
            </slot>
          </div>
          <div class="flex flex-shrink-0">
            <button
              v-if="primary.label"
              class="inline-flex cursor-pointer rounded-sm p-2 text-sm text-vanilla-100 transition duration-150 ease-in-out focus:outline-none"
              :class="
                type === 'danger'
                  ? 'bg-cherry-600 hover:bg-cherry-400'
                  : 'hover:bg-ink-500 bg-ink-400'
              "
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

interface PrimaryAction {
  label: string
  icon: string
  action: Function
}

@Component({})
export default class Toast extends Vue {
  @Prop({ default: '' })
  message!: string

  @Prop({ default: '' })
  type!: string

  @Prop({ default: true })
  progress!: boolean

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
