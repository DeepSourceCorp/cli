<template>
  <div class="members-page grid grid-cols-1 lg:grid-cols-16-fr">
    <nav
      class="hide-scroll vertical-sidebar hidden gap-x-8 overflow-x-auto border-slate-400 px-4 pt-2 lg:sticky lg:flex lg:flex-col lg:gap-y-1 lg:border-r lg:p-2"
    >
      <template v-for="item in navItems">
        <nuxt-link
          v-if="item.show"
          :key="item.label"
          :to="item.link"
          class="group flex-shrink-0 rounded-md text-sm hover:bg-ink-300"
        >
          <span
            class="flex items-center justify-between rounded-md p-2 group-hover:text-vanilla-100"
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

    <div class="max-w-3xl space-y-4 p-4 pb-28">
      <div>
        <h2 class="text-base font-medium leading-8">{{ pageData.title }}</h2>
        <p class="text-sm leading-6 text-vanilla-400">{{ pageData.subtitle }}</p>
        <div class="mt-3 flex gap-2">
          <z-input
            :value="searchCandidate"
            :show-border="false"
            background-color="ink-300"
            placeholder="Search..."
            size="small"
            class="p-2"
            @debounceInput="(newValue) => (searchCandidate = newValue)"
          >
            <template #left>
              <z-icon icon="search" class="ml-1.5" />
            </template>
          </z-input>
          <!-- TODO migrate Add seats modal here and then enable -->
          <!-- <nuxt-link-button
            v-if="$route.name === 'provider-owner-members-active'"
            :to="{ path: $generateRoute(['settings', 'billing']), query: { 'add-seats': true } }"
            button-type="secondary"
            class="flex-1"
          >
            <z-icon icon="rocking-chair" color="current" size="small" />
            <span>Add seats</span>
          </nuxt-link-button> -->
          <invite-members-modal
            v-if="canInviteMembers"
            class="flex-1 flex-shrink-0"
            @inviteSuccess="inviteSuccess"
          />
        </div>
      </div>
      <nuxt-child :search-candidate="searchCandidate" />
    </div>

    <floating-button-mobile :nav-items="navItemsForMobile" />
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import OwnerBillingMixin from '~/mixins/ownerBillingMixin'
import TeamDetailMixin from '@/mixins/teamDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { TeamPerms } from '~/types/permTypes'

/**
 * Team members parent page
 */
@Component({
  middleware: ['validateProvider'],
  layout: 'dashboard',
  scrollToTop: true
})
export default class Members extends mixins(TeamDetailMixin, OwnerBillingMixin, ActiveUserMixin) {
  showInviteModal = false
  searchCandidate = ''

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
        link: this.getRoute('active'),
        show: this.$gateKeeper.team(TeamPerms.VIEW_TEAM_MEMBERS, this.teamPerms.permission)
      },
      {
        label: 'Pending invites',
        routeName: 'provider-owner-members-invited',
        link: this.getRoute('invited'),
        count: this.pendingInvitesCount,
        show: this.$gateKeeper.team(TeamPerms.MANAGE_TEAM_MEMBERS, this.teamPerms.permission)
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

  get canInviteMembers(): boolean {
    return this.$gateKeeper.team(TeamPerms.MANAGE_TEAM_MEMBERS, this.teamPerms.permission)
  }

  async fetchInvitedMembers(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchInvitedUsers({
      login: owner,
      provider,
      currentPage: 1,
      limit: 20
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

  get pageData(): { title: string; subtitle: string } | false {
    if (this.$route.path == this.getRoute('active')) {
      return { title: 'My team', subtitle: 'Manage who has access to your workspace.' }
    }
    if (this.$route.path == this.getRoute('invited')) {
      return {
        title: 'Pending invites',
        subtitle: 'View who are yet to accept your workspace invitation.'
      }
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
