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
      class="w-full max-w-md mb-4 overflow-hidden text-sm text-black rounded-md shadow-lg pointer-events-auto"
    >
      <div class="overflow-hidden rounded-md shadow-xs z-100">
        <div class="flex flex-col p-4 bg-honey gap-y-2">
          <div class="flex items-center justify-between text-base">
            <div class="flex items-center gap-x-2">
              <z-icon icon="alert-circle" size="small" color="current"></z-icon>
              <h3 class="font-semibold">{{ title }}</h3>
            </div>
            <z-icon icon="x" color="current" @click="destroy" class="cursor-pointer"></z-icon>
          </div>
          <div class="pl-6">
            <p>
              <span class="text-sm font-semibold">{{
                formatDate(parseISODate(scheduledFrom), 'lll')
              }}</span>
              to
              <span class="text-sm font-semibold">{{
                formatDate(parseISODate(scheduledTill), 'lll')
              }}</span>
            </p>
            <p class="mt-1 text-sm">
              Affects <span class="font-semibold">{{ componentAffected }}</span>
            </p>
            <z-button
              :to="shortLink"
              size="small"
              target="_blank"
              rel="noreferrer noopener"
              class="mt-4 bg-honey-400 hover:bg-honey-300"
              >Read more
              <z-icon color="current" icon="arrow-right" class="ml-2" />
            </z-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsourcelabs/zeal'
import { parseISODate, formatDate } from '~/utils/date'

@Component({
  components: {
    ZIcon,
    ZButton
  },
  methods: {
    parseISODate,
    formatDate
  }
})
export default class StatusToast extends Vue {
  @Prop({ required: true })
  id: string

  @Prop({ default: '' })
  title: string

  @Prop({ default: '' })
  scheduledFrom: string

  @Prop({ default: '' })
  scheduledTill: string

  @Prop({ default: '' })
  componentAffected: string

  @Prop({ default: '' })
  shortLink: string

  public active = true

  public removeElement(el: Element): void {
    if (el) {
      if (typeof el.remove !== 'undefined') el.remove()
      else el.parentNode?.removeChild(el)
    }
  }

  public destroy(): void {
    localStorage.setItem(this.id, new Date().toISOString())
    this.active = false
  }

  public primaryAction() {
    this.destroy()
  }
}
</script>
