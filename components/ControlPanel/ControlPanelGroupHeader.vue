<template>
  <div class="p-4 border-b border-ink-200 pb-7">
    <div class="flex flex-col md:flex-row gap-y-0.5">
      <div>
        <div class="flex items-center gap-x-4">
          <okta-icon-wrapper
            dimensions="w-5 h-5"
            :is-okta="group.scimEnabled"
            class="flex-shrink-0"
          >
            <z-avatar :user-name="group.name" size="lg" :loading="loading" class="flex-shrink-0" />
          </okta-icon-wrapper>
          <div v-if="loading" class="h-10 w-56 py-px bg-ink-300 animate-pulse"></div>
          <div v-else>
            <p class="font-medium">
              {{ group.name }}
            </p>
            <div class="flex flex-wrap md:flex-nowrap items-center gap-x-3 text-vanilla-400">
              <div
                v-if="group.membersCount && group.membersCount.totalCount"
                class="flex items-center gap-x-1.5"
              >
                <z-icon icon="users" size="x-small" class="flex-shrink-0" />
                <span class="text-xs"
                  >{{ group.membersCount.totalCount }} member<span
                    v-if="group.membersCount.totalCount > 1"
                    >s</span
                  ></span
                >
              </div>
              <div
                v-if="group.teamsCount && group.teamsCount.totalCount"
                class="flex items-center gap-x-1.5"
              >
                <z-icon icon="globe" size="x-small" class="flex-shrink-0" />
                <span class="text-xs"
                  >{{ group.teamsCount.totalCount }} team<span
                    v-if="group.teamsCount.totalCount > 1"
                    >s</span
                  ></span
                >
              </div>
              <div class="flex items-center gap-x-1.5">
                <z-icon icon="clock" size="x-small" class="flex-shrink-0" />
                <span class="text-xs">Created {{ formatDate(parseISODate(group.createdAt)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap gap-3 mt-4 items-center">
      <control-panel-add-team-to-group-modal
        :group-id="$route.params.groupId"
        @refetch="refetchData"
      />
      <control-panel-group-invite-modal
        v-if="!group.scimEnabled"
        :group-id="$route.params.groupId"
      />
      <control-panel-edit-group-modal
        v-if="!group.scimEnabled"
        :group="group"
        @refetch="refetchData"
      />
      <delete-group-button v-if="!group.scimEnabled" :group="group" @refetch="refetchData" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZButton, ZAvatar, ZIcon } from '@deepsourcelabs/zeal'

import { EnterpriseGroup } from '~/types/types'
import { formatDate, parseISODate } from '~/utils/date'

@Component({
  components: { ZButton, ZAvatar, ZIcon },
  name: 'ControlPanelUserHeader'
})
export default class ControlPanelUserHeader extends Vue {
  @Prop({ required: true })
  group: EnterpriseGroup

  @Prop({ default: false })
  loading: boolean

  parseISODate = parseISODate
  formatDate = formatDate

  refetchData(): void {
    this.$emit('refetch')
  }
}
</script>
