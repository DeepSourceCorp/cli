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
      <p class="w-44 overflow-hidden overflow-ellipsis text-sm">
        {{ orgUser.fullName || orgUser.email }}
      </p>
      <div class="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <z-tag
            icon-left="solid-circle"
            bg-color="ink-300"
            text-size="xxs"
            size="x-small"
            spacing="px-1.5 py-1"
            :icon-color="orgUser.isActive ? 'juniper' : 'honey'"
            class="gap-x-1 font-semibold uppercase leading-none tracking-wide text-vanilla-400"
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
            class="gap-x-1 font-semibold uppercase leading-none tracking-wide text-vanilla-400"
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
import { EnterpriseUser } from '~/types/types'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
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
