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
      class="w-full max-w-sm mb-4 overflow-hidden rounded-lg shadow-lg pointer-events-auto"
    >
      <div :class="classToastAll" class="overflow-hidden rounded-lg shadow-xs z-100">
        <div
          class="flex items-center p-2 leading-none"
          :class="{
            'bg-cherry': type === 'danger'
          }"
        >
          <div class="flex-shrink-0">
            <div v-if="type === 'success'" class="p-1 rounded-full">
              <z-icon icon="check-circle" size="small" color="juniper" />
            </div>
            <div v-else-if="type === 'danger'" class="p-1 rounded-full">
              <z-icon icon="alert-circle" size="small" color="vanilla-100" />
            </div>
            <div v-else-if="type === 'info'" class="p-1 rounded-full">
              <z-icon icon="alert-circle" size="small" color="vanilla-400" />
            </div>
          </div>
          <div class="w-0 flex-1 px-2 mt-0.5">
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
              class="inline-flex p-2 text-sm transition duration-150 ease-in-out rounded-sm cursor-pointer text-vanilla-100 focus:outline-none"
              :class="
                type === 'danger'
                  ? 'bg-cherry-600 hover:bg-cherry-400'
                  : 'bg-ink-400 hover:bg-ink-500'
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
import { ZIcon } from '@deepsource/zeal'

interface PrimaryAction {
  label: string
  icon: string
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
