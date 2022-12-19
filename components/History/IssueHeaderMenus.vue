<template>
  <div class="flex gap-2 w-full flex-row-reverse xl:flex-row py-4">
    <!-- Sort menu -->
    <z-menu direction="left" width="40" class="text-vanilla-100">
      <template v-slot:trigger="{ toggle }">
        <z-button
          type="button"
          buttonType="secondary"
          icon="amount-down"
          size="small"
          @click="toggle"
        >
          Sort
        </z-button>
      </template>
      <template slot="body" class="text-vanilla-200">
        <z-menu-item v-for="filter in sortFilters" v-bind:key="filter.name" :icon="filter.icon">
          {{ filter.label }}
        </z-menu-item>
      </template>
    </z-menu>
    <!-- Filter Menu -->
    <z-menu direction="left" width="40" class="text-vanilla-100">
      <template v-slot:trigger="{ toggle }">
        <z-badge slot="trigger" type="success" is-dot :hidden="false">
          <button
            type="button"
            class="inline-flex items-center px-3 py-2 space-x-2 text-sm leading-none rounded-sm shadow-sm outline-none lg:px-4 bg-ink-300 hover:bg-ink-200 text-vanilla-100 focus:outline-none"
            @click="toggle"
          >
            <z-icon icon="z-filter" size="small"></z-icon>
            <span class="hidden lg:inline-block">Filter</span>
          </button>
        </z-badge>
      </template>
      <template slot="body">
        <z-menu-item icon="autofix">Autofix Available</z-menu-item>
      </template>
    </z-menu>
    <!-- Search -->
    <div class="flex-grow xl:min-w-80">
      <z-input
        v-model="searchIssue"
        size="small"
        icon="search"
        backgroundColor="ink-300"
        placeholder="Search for issue title, file or issue code"
        :showBorder="false"
      ></z-input>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ZIcon, ZBadge, ZInput, ZMenu, ZMenuItem } from '@deepsource/zeal'
@Component({
  components: {
    ZIcon,
    ZInput,
    ZBadge,
    ZMenu,
    ZMenuItem
  }
})
export default class IssueHeaderMenus extends Vue {
  public searchIssue = ''
  private languageFilters: Array<Record<string, string | boolean>> = [
    { name: 'python', icon: 'python', label: 'Python' },
    { name: 'go', icon: 'golang', label: 'Go' },
    { name: 'javascript', icon: 'javascript', label: 'JavaScript' }
  ]

  private sortFilters: Array<Record<string, string | boolean>> = [
    { label: 'Most Frequent', icon: 'most-frequent', name: 'most-frequent' },
    { label: 'Least Frequent', icon: 'least-frequent', name: 'least-frequent' },
    { label: 'First Seen', icon: 'first-seen', name: 'first-seen' },
    { label: 'Last Seen', icon: 'last-seen', name: 'last-seen' }
  ]
}
</script>
