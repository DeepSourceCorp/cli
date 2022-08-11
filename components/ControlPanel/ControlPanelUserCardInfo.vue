<template>
  <div class="flex items-center gap-x-3">
    <okta-icon-wrapper :is-okta="orgUser.scimEnabled" class="flex-shrink-0">
      <z-avatar
        :image="orgUser.avatar"
        :fallback-image="getDefaultAvatar(orgUser.email)"
        :user-name="orgUser.fullName"
        :loading="loading"
        class="flex-shrink-0"
      />
    </okta-icon-wrapper>
    <div>
      <p class="overflow-hidden text-sm w-44 overflow-ellipsis">
        {{ orgUser.fullName || orgUser.email }}
      </p>
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <z-tag
            icon-left="solid-circle"
            bg-color="ink-300"
            text-size="xxs"
            size="x-small"
            spacing="px-1.5 py-1"
            :icon-color="orgUser.isActive ? 'juniper' : 'honey'"
            class="font-semibold leading-none tracking-wide uppercase text-vanilla-400 gap-x-1"
          >
            {{ orgUser.isActive ? 'Active' : 'Inactive' }}
          </z-tag>
          <z-tag
            v-if="orgUser.isSuperuser"
            icon-left="solid-circle"
            bg-color="ink-300"
            text-size="xxs"
            size="x-small"
            spacing="px-1.5 py-1"
            icon-color="robin"
            class="font-semibold leading-none tracking-wide uppercase text-vanilla-400 gap-x-1"
          >
            Superuser
          </z-tag>
        </div>
        <div class="flex items-center gap-x-1.5 text-vanilla-400">
          <z-icon icon="mail" size="x-small" color="current" class="flex-shrink-0" />
          <span class="text-xs">{{ orgUser.email }}</span>
        </div>
        <div
          v-if="orgUser.groupsCount && orgUser.groupsCount.totalCount"
          class="flex items-center gap-x-1.5"
        >
          <z-icon icon="globe" size="x-small" class="flex-shrink-0" />
          <span class="text-xs"
            >{{ orgUser.groupsCount.totalCount }} group<span
              v-if="orgUser.groupsCount.totalCount > 1"
              >s</span
            ></span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZAvatar, ZTag } from '@deepsourcelabs/zeal'
import { EnterpriseUser } from '~/types/types'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
  components: { ZIcon, ZAvatar, ZTag },
  name: 'ControlPanelUserCardInfo',
  methods: { getDefaultAvatar }
})
export default class ControlPanelUserCardInfo extends Vue {
  @Prop({ required: true })
  orgUser: EnterpriseUser

  @Prop({ default: false })
  loading: boolean
}
</script>
