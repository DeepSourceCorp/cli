<template>
  <div class="grid grid-cols-1 lg:grid-cols-16-fr members-page">
    <nav
      class="hidden px-4 pt-2 overflow-x-auto border-b gap-x-8 hide-scroll border-ink-200 lg:sticky lg:flex lg:flex-col lg:gap-y-1 lg:p-2 lg:border-r vertical-sidebar"
    >
      <template v-for="item in navItems">
        <nuxt-link
          :to="item.link"
          :key="item.label"
          class="flex-shrink-0 text-sm rounded-md group hover:bg-ink-300"
        >
          <span
            class="flex items-center justify-between p-2 rounded-md group-hover:text-vanilla-100"
            :class="
              $route.path.startsWith(item.link) ? 'bg-ink-300 text-vanilla-100' : 'text-vanilla-400'
            "
            >{{ item.label }}
            <z-tag
              v-if="item.count"
              :bg-color="$route.path.startsWith(item.link) ? 'ink-200' : 'ink-300'"
              text-size="xs"
              spacing="py-1 px-2"
              class="leading-none group-hover:bg-ink-200"
              ><span class="mt-px">{{ item.count > 9 ? '9+' : item.count }}</span></z-tag
            >
          </span>
        </nuxt-link>
      </template>
    </nav>

    <div class="max-w-3xl p-4 space-y-8">
      <div class="space-y-4">
        <div v-if="pageHeading" class="flex justify-between">
          <h2 class="text-lg font-medium">{{ pageHeading }}</h2>
          <invite-members-modal @inviteSuccess="inviteSuccess" />
        </div>

        <nuxt-child class="mb-28 lg:mb-0" />
      </div>
    </div>

    <floating-button-mobile :nav-items="navItemsForMobile" />
  </div>
</template>
<script lang="ts">
import { ZButton, ZIcon, ZModal, ZTab, ZTag } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import { InviteMembersModal } from '@/components/Members'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'
import TeamDetailMixin from '@/mixins/teamDetailMixin'

@Component({
  components: {
    ZTab,
    ZButton,
    ZIcon,
    InviteMembersModal,
    ZModal,
    ZTag
  },
  middleware: ['validateProvider'],
  layout: 'dashboard',
  scrollToTop: true
})
export default class Members extends mixins(TeamDetailMixin, OwnerBillingMixin) {
  showInviteModal = false

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    const args = { login: owner, provider }

    await Promise.all([
      this.fetchInvitedMembers(),
      this.fetchSeatsInfo(args),
      this.fetchInviteUrl(args)
    ])
  }

  get navItems() {
    return [
      {
        label: 'My team',
        routeName: 'provider-owner-members-active',
        link: this.getRoute('active')
      },
      {
        label: 'Pending invites',
        routeName: 'provider-owner-members-invited',
        link: this.getRoute('invited'),
        count: this.pendingInvitesCount
      }
    ]
  }

  get navItemsForMobile() {
    return this.navItems.map((item) => {
      return {
        label: item.label,
        routePath: item.link
      }
    })
  }

  async fetchInvitedMembers(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchInvitedUsers({
      login: owner,
      provider,
      currentPage: 1,
      limit: 10
    })
  }

  /**
   * Handler method for the `inviteSuccess` event emitted
   * by `InviteMembersModal`
   *
   * @returns {Promise<void>}
   */
  async inviteSuccess(): Promise<void> {
    await this.fetchInvitedMembers()

    const { owner: login, provider } = this.$route.params
    const args = { login, provider, refetch: true }
    this.fetchSeatsInfo(args)
  }

  get pendingInvitesCount(): number {
    return this.team.invites?.totalCount || 0
  }

  getRoute(candidate: string): string {
    return this.$generateRoute(['members', candidate])
  }

  get pageHeading(): string | false {
    if (this.$route.path == this.getRoute('active')) {
      return 'My team'
    }
    if (this.$route.path == this.getRoute('invited')) {
      return 'Pending invites'
    }
    return false
  }

  head(): Record<string, string> {
    const { owner } = this.$route.params
    return {
      title: `Members • ${owner}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>

<style scoped>
.members-page {
  /* The dashboard header comprising of the team/user avatar, VCS icon, etc. */
  --dashboard-header-height: 53px;

  /* The horizontal navbar as part of `dashboard`` layout */
  --horizontal-navbar-height: 44.5px;

  /* The vertical sidebar top position would be the sum of aforementioned values */
  --vertical-sidebar-top-offset: calc(
    var(--dashboard-header-height) + var(--horizontal-navbar-height)
  );
}

@media screen and (min-width: 1024px) {
  .vertical-sidebar {
    top: var(--vertical-sidebar-top-offset);
    height: calc(100vh - var(--vertical-sidebar-top-offset));
  }
}
</style>
