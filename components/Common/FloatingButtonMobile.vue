<template>
  <portal to="floating-nav">
    <div
      class="fixed bottom-0 left-0 right-0 w-screen bg-gradient-to-t from-ink-400 to-transparent px-4 pb-5 font-medium lg:hidden"
    >
      <Menu
        :triggers="['click', 'touch']"
        placement="top"
        theme="deepsource-dropdown"
        class="bottom-0 w-full border-0 text-center"
        @apply-show="onShow"
        @apply-hide="onHide"
      >
        <template #default="{ shown }">
          <button
            class="ds-mobile-menu-trigger mx-auto flex w-64 items-center justify-between divide-x divide-ink-100 rounded-lg bg-ink-300 px-4 py-3 text-sm text-vanilla-100 shadow-lg"
          >
            <span class="truncate">
              {{ currentSelection }}
            </span>
            <span class="border-slate-400 pl-4">
              <z-icon
                button-type="secondary"
                size="small"
                icon="chevron-up"
                class="flex-shrink-0 transform duration-150"
                :class="{ 'rotate-180': shown }"
              />
            </span>
          </button>
        </template>

        <template #popper="{ hide }">
          <nav class="w-64 rounded-sm bg-ink-300 py-1">
            <template v-for="item in navItems">
              <nuxt-link
                :key="item.label"
                :to="item.routePath"
                class="flex items-center justify-between px-4 py-2.5"
                :class="[
                  matchesCurrentRoutePath(item.routePath) ? 'text-vanilla-100' : 'text-vanilla-400',
                  { 'border-t border-t-ink-200': item.separator }
                ]"
                @click.native="hide"
              >
                <span class="text-sm">{{ item.label }}</span>
                <z-icon v-if="matchesCurrentRoutePath(item.routePath)" icon="check" />
              </nuxt-link>
            </template>
          </nav>
        </template>
      </Menu>
    </div>
  </portal>
</template>

<script lang="ts">
import { Menu } from 'floating-vue'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

interface INavItem {
  label: string
  routePath: string
  separator?: boolean
}

/**
 * The floating button component introduced in the new team home layout
 */
@Component({ name: 'FloatingButtonMobile', components: { Menu } })
export default class FloatingButtonMobile extends Vue {
  @Prop({ required: true })
  navItems: INavItem[]

  /**
   * The `BeforeDestroy` hook
   * Remove scroll lock
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.onHide()
  }

  get currentSelection(): string {
    const selection = this.navItems.find(({ routePath }) =>
      this.matchesCurrentRoutePath(routePath)
    ) as INavItem

    return selection?.label || ''
  }

  /**
   * Prevent scrolling when the nav items are visible
   *
   * @returns {void}
   */
  onShow(): void {
    document.body.classList.add('overflow-hidden')
  }

  /**
   * Allow scrolling when the nav items are hidden
   *
   * @returns {void}
   */
  onHide(): void {
    document.body.classList.remove('overflow-hidden')
  }

  /**
   * Helper that returns a boolean denoting if the supplied route name matches the current
   * Used to compute the current selection (active route)
   *
   * @param {string} routePathCandidate
   * @returns {boolean}
   */
  matchesCurrentRoutePath(routePathCandidate: string): boolean {
    return this.$route.path.startsWith(routePathCandidate)
  }
}
</script>
