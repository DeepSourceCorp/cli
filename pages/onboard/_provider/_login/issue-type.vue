<template>
  <div class="mx-auto min-h-screen w-screen text-vanilla-100 flex">
    <!-- Left Section -->
    <div class="w-full xl:w-7/12 mx-auto bg-ink-400 flex flex-col justify-center items-center">
      <div
        class="p-6 md:p-0 flex flex-col h-full md:h-auto w-full overflow-scroll md:overflow-hidden items-center justify-center md:w-3/5 2xl:gap-y-16 sm:gap-y-8"
      >
        <!-- Stepper Component -->
        <div class="w-full hidden md:block">
          <z-stepper>
            <z-step title="Step 1" description="Connect provider" status="completed"></z-step>
            <z-step title="Step 2" description="Set preferences" status="active"></z-step>
            <z-step title="Step 3" description="Pick a repository"></z-step>
          </z-stepper>
        </div>
        <!-- Issue list Section -->
        <div class="h-full flex flex-col gap-y-6 w-full">
          <!-- Heading -->
          <div class="w-full">
            <p class="text-left text-base text-vanilla-300 leading-6">
              Which types of issues do you care about the most?
            </p>
            <p class="text-left text-xs text-vanilla-400 leading-6 mt-2">
              This will help us tailor the issues detected to your preferences.
            </p>
          </div>
          <!-- List of Issue Types-->
          <div class="w-full pb-12 md:pb-0 grid grid-cols-1 md:grid-cols-2 auto-rows-max gap-4">
            <div
              v-for="issue in issueTypes"
              class="p-3 cursor-pointer rounded-md border border-ink-300 transition-all duration-100"
              :key="issue.name"
              :class="issue.isChecked ? 'bg-ink-300' : 'bg-ink-400 '"
              @click.prevent="issue.isChecked = !issue.isChecked"
            >
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <z-icon :icon="issue.icon" color="vanilla-100"></z-icon>
                  <span class="flex-1 font-medium">{{ issue.label }}</span>
                  <z-checkbox :name="issue.name" v-model="issue.isChecked" />
                </div>
                <div class="flex-1 text-vanilla-400 text-sm">
                  {{ issue.description }}
                </div>
              </div>
            </div>
          </div>
          <div class="fixed md:static bottom-0 w-full left-0">
            <z-button
              buttonType="primary"
              class="w-full"
              :disabled="nextDisabled"
              @click="submitSettings"
            >
              Save configuration and proceed
            </z-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/*
This page shows a list issue types that a user can select from
once selected the mutation `updateOwnerSettings` is triggered

mutation ($input: UpdateOwnerSettingsInput!) {
  updateOwnerSettings(input: $input) {
    ok
  }
}

with the following payload

{
  ownerId: <owner-id>,
  issueTypeSettings: [
    {
      slug: "bug-risk",
      isIgnoredToDisplay: false,
      isIgnoredInCheckStatus: false
    },
    { ... },
    { ... },
    { ... },
    { ... }
  ]
}
*/

import { Component, mixins, Watch } from 'nuxt-property-decorator'

import {
  ZExpandable,
  ZStepper,
  ZStep,
  ZIcon,
  ZButton,
  ZCheckbox,
  ZCard
} from '@deepsourcelabs/zeal'

import { IssueTypeSetting } from '~/types/types'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import { TeamPerms } from '~/types/permTypes'

export interface Issue {
  name: string
  icon: string
  label: string
  description: string
  isChecked: boolean
  example: {
    snippet: string
    title: string
  }
}

const ISSUE_TYPES: Record<string, Issue> = {
  'bug-risk': {
    name: 'bug-risk',
    icon: 'bug-risk',
    label: 'Bug risk',
    description: 'Issues that can cause bugs and breakage in production',
    isChecked: true,
    example: {
      snippet:
        'Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.',
      title: 'Non-iterable value used in an iterating context'
    }
  },
  security: {
    name: 'security',
    icon: 'security',
    label: 'Security',
    description: 'Issues that can potentially be or lead to a security vulnerability',
    isChecked: true,
    example: {
      snippet:
        'Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.',
      title: 'Audit required: Insecure hash function'
    }
  },
  coverage: {
    name: 'coverage',
    icon: 'coverage',
    label: 'Coverage',
    description: 'Lapses in test coverage in the source code',
    isChecked: true,
    example: {
      snippet:
        'Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.',
      title: 'Lines not covered in tests'
    }
  },
  antipattern: {
    name: 'antipattern',
    icon: 'antipattern',
    label: 'Anti-pattern',
    description: 'Code patterns that affect maintainibility negatively',
    isChecked: true,
    example: {
      snippet:
        'Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.',
      title: 'Exception caught is very general'
    }
  },
  performance: {
    name: 'performance',
    icon: 'performance',
    label: 'Performance',
    description: 'Issues that impact performance code when in production',
    isChecked: true,
    example: {
      snippet:
        'Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.',
      title: 'No use of self'
    }
  },
  typecheck: {
    name: 'typecheck',
    icon: 'typecheck',
    label: 'Typecheck',
    description: 'Typing violations for a dynamically typed language',
    isChecked: true,
    example: {
      snippet:
        'Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.',
      title: 'Missing explicit return types'
    }
  },
  style: {
    name: 'style',
    icon: 'style',
    label: 'Style',
    description: 'Violation in the code format due to difference in style guide',
    isChecked: false,
    example: {
      snippet:
        'Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.',
      title: 'Should not use mixed spaces and tabs for indentation'
    }
  },
  doc: {
    name: 'doc',
    icon: 'doc',
    label: 'Documentation',
    description: 'Lapses in source code documentation',
    isChecked: false,
    example: {
      snippet:
        'Consistent within interface: all elements should be consistent, such as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc uch as: design style, icons and texts, position of elements, etc.',
      title: 'Non-iterable value used in an iterating context'
    }
  }
}

@Component({
  components: {
    ZExpandable,
    ZStepper,
    ZStep,
    ZIcon,
    ZButton,
    ZCheckbox,
    ZCard
  },
  meta: {
    auth: {
      strict: true
    }
  }
})
export default class IssuePreference extends mixins(OwnerDetailMixin) {
  public issueTypes: Record<string, Issue> = ISSUE_TYPES

  async fetch(): Promise<void> {
    // fetch all the issue preferences user has set
    const { login, provider } = this.$route.params
    await this.fetchIssueTypeSettings({ login, provider })
    this.updateIssueTypes()
  }

  updateIssueTypes() {
    this.owner?.ownerSetting?.issueTypeSettings?.forEach((issue) => {
      if (issue) {
        const { slug, isIgnoredInCheckStatus } = issue
        if (slug && typeof slug === 'string' && slug in this.issueTypes) {
          this.issueTypes[slug].isChecked = !isIgnoredInCheckStatus
        }
      }
    })
  }

  async submitSettings(): Promise<void> {
    const { login, provider } = this.$route.params
    await this.submitIssueTypeSettings({
      login,
      provider,
      preferences: this.issuePreferences
    })
    this.updateIssueTypes()
    this.$router.push(`/onboard/${provider}/${login}/repositories`)
  }

  get nextDisabled(): boolean {
    return this.issuePreferencesArray.filter((issue) => issue.isChecked).length === 0
  }

  get issuePreferencesArray(): Issue[] {
    return Object.keys(this.issueTypes).map((issueName) => {
      return this.issueTypes[issueName]
    })
  }

  get issuePreferences(): IssueTypeSetting[] {
    return this.issuePreferencesArray.map((issue) => {
      return {
        isIgnoredInCheckStatus: !issue.isChecked,
        isIgnoredToDisplay: !issue.isChecked,
        slug: issue.name
      }
    })
  }
}
</script>
