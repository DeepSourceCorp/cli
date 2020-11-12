<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl block">Issue preference</span>
    <label v-for="issueType in issue_type_settings" :key="issueType.id" class="block my-2">
      <input type="checkbox" /> {{ issueType.name }}
      <p class="block text-sm ml-4">{{ issueType.description }}</p>
    </label>

    <nuxt-link class="border cursor-pointer p-2" to="">Proceed with these issues</nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, namespace } from 'nuxt-property-decorator'

const runList = namespace('runList')

@Component
export default class GenerateConfig extends Vue {
  issue_type_settings = [
    {
      id: 1,
      name: 'Bug Risk',
      slug: 'bug-risk',
      description: 'Issues that can cause bugs and breakages in production',
      is_ignored_in_check_status: false,
      is_ignored_to_display: false
    },
    {
      id: 2,
      name: 'Anti-pattern',
      slug: 'antipattern',
      description:
        'Code patterns that are correct, but not recommended because they affect maintainability',
      is_ignored_in_check_status: false,
      is_ignored_to_display: false
    },
    {
      id: 3,
      name: 'Performance',
      slug: 'performance',
      description: "Issues that impact performance of the code when it's executed in production",
      is_ignored_in_check_status: false,
      is_ignored_to_display: false
    },
    {
      id: 4,
      name: 'Security',
      slug: 'security',
      description:
        'Potential bug in the code which creates a potential risk of compromised security',
      is_ignored_in_check_status: false,
      is_ignored_to_display: false
    },
    {
      id: 5,
      name: 'Type Check',
      slug: 'typecheck',
      description:
        'Typing violations if you are using a type checker for a dynamically typed language',
      is_ignored_in_check_status: false,
      is_ignored_to_display: false
    },
    {
      id: 6,
      name: 'Coverage',
      slug: 'coverage',
      description: 'Lapses in test or documentation coverage in the source code',
      is_ignored_in_check_status: false,
      is_ignored_to_display: false
    },
    {
      id: 7,
      name: 'Style',
      slug: 'style',
      description: 'Violations in the code format according to a style guide',
      is_ignored_in_check_status: true,
      is_ignored_to_display: false
    },
    {
      id: 8,
      name: 'Documentation',
      slug: 'doc',
      description: 'Lapses in source code documentation',
      is_ignored_in_check_status: true,
      is_ignored_to_display: false
    }
  ]
}
</script>
