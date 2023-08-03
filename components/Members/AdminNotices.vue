<template>
  <z-alert
    :type="noticeMeta[type].type"
    :dismissible="noticeMeta[type].dismissible"
    v-on="noticeMeta[type].handlers"
  >
    <div class="flex flex-wrap items-center gap-x-8 gap-y-4 md:flex-nowrap">
      <div class="flex gap-x-3">
        <z-icon
          :icon="noticeMeta[type].icon"
          :color="noticeMeta[type].iconColor || 'current'"
          class="mt-0.5 hidden flex-shrink-0 md:inline-block"
        />
        <span class="text-sm leading-6" :class="noticeMeta[type].copyColor">{{
          noticeMeta[type].copy
        }}</span>
      </div>

      <z-button
        v-if="noticeMeta[type].cta"
        :icon="noticeMeta[type].cta.icon"
        :label="noticeMeta[type].cta.copy"
        :to="noticeMeta[type].cta.to"
        button-type="ghost"
        color="vanilla-100"
        size="small"
        class="ml-auto w-full bg-robin bg-opacity-20 md:w-auto"
      />
    </div>
  </z-alert>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

export enum AdminNoticeTypes {
  addMoreSeats,
  upgradePlan,
  enterprise,
  oneAdmin
}

@Component({ name: 'AdminNotices' })
export default class AdminNotices extends Vue {
  @Prop({ type: [Number, String], required: true })
  type: AdminNoticeTypes

  readonly noticeMeta = {
    [AdminNoticeTypes.addMoreSeats]: {
      icon: 'solid-alert-circle',
      type: 'info',
      copy: 'All member seats are occupied. Please add more seats to invite new members to your team.',
      copyColor: 'text-robin-300',
      dismissible: false
    },
    [AdminNoticeTypes.upgradePlan]: {
      icon: 'solid-alert-circle',
      type: 'info',
      copy: 'You have reached the member seats limit for your plan. Please upgrade to get more seats.',
      copyColor: 'text-robin-300',
      dismissible: false,
      cta: {
        icon: 'zap',
        copy: 'Upgrade plan',
        to: this.$generateRoute(['settings', 'billing'])
      }
    },
    [AdminNoticeTypes.enterprise]: {
      icon: 'solid-alert-circle',
      type: 'info',
      copy: 'You have reached the seat limit for your plan. Please reach out to us to explore your options for an upgrade.',
      copyColor: 'text-robin-300',
      dismissible: false,
      cta: {
        icon: 'mail',
        copy: 'Contact sales',
        to: 'mailto:sales@deepsource.io'
      }
    },
    [AdminNoticeTypes.oneAdmin]: {
      icon: 'solid-alert-circle',
      iconColor: 'text-honey-500',
      type: 'warning',
      copy: 'You are currently the only administrator of this team. We recommend adding at least one more administrator to improve the bus factor.',
      dismissible: true,
      handlers: {
        dismiss: () => {
          this.$emit('dismiss', AdminNoticeTypes.oneAdmin)
        }
      }
    }
  }
}
</script>
