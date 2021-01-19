<template>
  <div class="mx-auto h-screen w-screen text-vanilla-100 flex">
      <!-- Left Section -->
    <div class="w-full xl:w-7/12 bg-ink-400 flex flex-col justify-center items-center">
        <div class="p-6 md:p-0 flex flex-col h-full md:h-auto w-full overflow-scroll md:overflow-hidden items-center justify-center md:w-3/5 2xl:gap-y-16 sm:gap-y-8">
            <!-- Stepper Component -->
            <div class="w-full hidden md:block">
                <z-stepper :active="2">
                    <z-step title="Step 1" description="Connect Provider"></z-step>
                    <z-step title="Step 2" description="Set Preferences"></z-step>
                    <z-step title="Step 3" description="Pick a repository"></z-step>
                </z-stepper>
            </div>
            <!-- Issue list Section -->
            <div class="h-full flex flex-col gap-y-6 w-full">
                <!-- Heading -->
                <div class="w-full">
                    <p class="text-left text-base text-vanilla-300 leading-6">Which types of issues do you care about the most?</p>
                    <p class="text-left text-xs text-vanilla-400 leading-6 mt-2">This will help us tailor the issues detected to your preferences.</p>
                </div>
                <!-- List of Issue Types-->
                <div class="w-full pb-12 md:pb-0 grid grid-cols-1 md:grid-cols-2 auto-rows-max gap-6 sm:gap-2.5">
                    <template v-for="preference in issuePreferences">
                        <div class="p-3 cursor-pointer" 
                            :key="preference.name"
                            :class="preference.isChecked ? 'bg-ink-300' : 'bg-ink-400'">
                            <z-card>
                                <template slot="header">
                                    <div class="header flex mb-2">
                                        <z-icon :icon="preference.name" class="mr-2" color="vanilla-100"></z-icon>
                                        <span class="flex-1 font-medium">{{preference.label}}</span>
                                        <z-checkbox :value="preference.name" v-model="preference.isChecked"/>
                                    </div>
                                </template>
                                <template slot="body">
                                    <div class="flex-1 text-vanilla-400 text-sm">
                                        {{preference.description}}
                                    </div>
                                </template>
                            </z-card>
                        </div>
                    </template>
                </div>
                <div class="fixed md:static bottom-0 w-full left-0">
                    <z-button color="primary" class="w-full">Save configuration and proceed</z-button>
                </div>
            </div>
        </div>
    </div>
    <!-- Right Section -->
    <div class="hidden w-5/12 bg-ink-300 xl:flex items-center justify-center">
        <!-- Issue Preferences Snippets -->
        <div class="sm:w-9/12">
            <template v-for="issue in issueDetails">
                <z-expandable :open="issue.isOpen" :key="issue.name">
                    <template slot="header">
                        <p><z-icon :icon="issue.name" class="inline-block mr-2 align-text-bottom" color="vanilla-100" size="small"></z-icon>{{issue.title}}</p>
                    </template>
                    <template slot="content">
                        <p>{{issue.snippet}}</p>
                    </template>
                </z-expandable>
            </template>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';
import { ZExpandable, ZStepper, ZStep, ZIcon, ZButton, ZCheckbox, ZCard } from "@deepsourcelabs/zeal";
import { contentFunc, IContentDocument } from '@nuxt/content/types/content';

@Component({
  components: {
    ZExpandable,
    ZStepper,
    ZStep,
    ZIcon,
    ZButton,
    ZCheckbox,
    ZCard
  }
})
export default class IssuePreference extends Vue {
    private issuePreferences: Array<Record<string, unknown>> = [];
    private issueDetails: Array<Record<string, unknown>> = []
    content!: IContentDocument;
    created() {
        this.issuePreferences = this.content['issue-preferences'];
        this.issueDetails = this.content['issue-details']
    }

    // TODO: These preferences and their respective code snippets will be fetched from API
    async asyncData({ $content }: {$content: contentFunc}) {
        const content = await $content('issue-preferences').fetch()
        return { content }
    }
}
</script>
