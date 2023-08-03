<template>
  <div class="flex flex-col space-y-4">
    <!-- Code -->
    <div
      v-for="(change, name) in changeSet"
      :key="name"
      class="code relative flex flex-col rounded-sm border border-slate-400"
    >
      <div
        v-if="isGroup"
        class="absolute top-4 h-0.5 w-6 -translate-x-full transform bg-juniper"
      ></div>
      <!-- title -->
      <div class="flex items-center space-x-1 border-b border-slate-400 bg-ink-300 p-2 text-sm">
        <z-checkbox
          v-if="!isReadOnly"
          v-model="selectedFiles"
          :value="name"
          class="h-full"
          :true-value="true"
          :false-value="false"
          size="small"
          @change="selectFile(name)"
        />
        <span
          class="flex-1 font-medium"
          :class="{
            'text-cherry': change.patches && change.patches[0].action === 'deleted',
            'text-vanilla-400': change.patches && change.patches[0].action === 'modified'
          }"
          >{{ name }}</span
        >
        <!-- Issue Labels for showing the issues that are related to a patch -->
        <span v-if="isGeneratedFromPr && change.issues">
          <template v-if="change.issues.length > 3">
            <template v-for="(num, idx) in 3">
              <span
                :key="num"
                v-tooltip="change.issues[num - 1].title"
                class="text-sm text-vanilla-100"
              >
                {{ change.issues[num - 1] && change.issues[num - 1].shortcode.toUpperCase() }}
              </span>

              <!-- Render comma expect after the last item -->
              {{ idx + 1 !== 3 ? ',' : '' }}
            </template>

            <span>&amp; {{ change.issues.length - 3 }} more</span>
          </template>

          <template v-else>
            <template v-for="(issue, idx) in change.issues">
              <span :key="issue.shortcode" v-tooltip="issue.title" class="text-sm text-vanilla-100">
                {{ issue.shortcode.toUpperCase() }}
              </span>

              <!-- Render comma if the list has more than one element except after the last item -->
              {{ change.issues.length > 1 && idx + 1 !== change.issues.length ? ',' : '' }}
            </template>
          </template>
        </span>
      </div>

      <div v-if="snippetsLoading" class="h-44 animate-pulse bg-ink-300"></div>

      <div
        v-else-if="snippetsFetchErrored"
        class="flex flex-col items-center justify-center gap-y-3 p-6"
      >
        <img
          src="~/assets/images/ui-states/no-accounts.png"
          alt="Fetching of source patch snippets errored"
          class="h-8 w-10"
        />
        <p class="max-w-sm text-center text-xs text-vanilla-400">Could not load the patch.</p>
      </div>

      <!-- Editor -->
      <template v-else>
        <div
          v-for="(code, index) in change.patches"
          :key="code.id"
          class="flex w-full"
          :class="{ 'border-b-2 border-slate-400': index !== change.patches.length - 1 }"
        >
          <div
            class="flex items-start bg-ink-300 pt-4"
            :class="{
              'pl-2': !isReadOnly && code.action === 'modified' && code.action !== 'deleted'
            }"
          >
            <z-checkbox
              v-if="!isReadOnly && code.action === 'modified' && code.action !== 'deleted'"
              v-model="selectedHunkIds"
              :value="code.id"
              size="small"
              font-size="base"
              spacing="4"
              @change="selectFileIfAllHunksSelected(name, code.id)"
            />
          </div>

          <template v-if="code.action === 'deleted'">
            <div :class="{ 'bg-ink-300 opacity-20': !isHunkSelected(code.id) }">
              <span v-if="autofixRun.pullRequestStatus === PULL_REQUEST_STATUS.MERGED"
                >This file was deleted</span
              >
              <span v-else>This file will be deleted</span>
            </div>
          </template>

          <div
            v-if="!code.before_html || !code.after_html"
            class="flex flex-grow flex-col items-center justify-center gap-y-3 p-6"
          >
            <img
              src="~/assets/images/ui-states/no-accounts.png"
              alt="Fetching of source patch snippets errored"
              class="h-8 w-10"
            />
            <p class="max-w-sm text-center text-xs text-vanilla-400">Could not load the patch.</p>
          </div>

          <template v-else>
            <div class="grid w-full grid-cols-2">
              <div
                class="after_html col-span-1 border-r border-slate-400"
                :class="{
                  'bg-ink-300 opacity-20': !isHunkSelected(code.id)
                }"
              >
                <z-code :content="code.before_html" />
              </div>
              <div
                class="before_html col-span-1"
                :class="{
                  'bg-ink-300 opacity-20': !isHunkSelected(code.id)
                }"
              >
                <z-code :content="code.after_html" />
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { Maybe, Scalars } from '~/types/types'

/**
 * View the diff for a given Autofix session
 */
@Component({})
export default class AutofixCodeDiff extends Vue {
  @Prop()
  isGroup!: boolean

  @Prop()
  changeSet!: Maybe<Scalars['GenericScalar']>

  @Prop()
  selectedFiles!: Array<string>

  @Prop()
  isReadOnly!: boolean

  @Prop()
  selectedHunkIds!: Array<number>

  @Prop()
  isGeneratedFromPr!: boolean

  @Prop({ default: false })
  snippetsLoading: boolean

  @Prop({ default: false })
  snippetsFetchErrored: boolean

  isChecked = false

  /**
   * Emits an event by the name `selectFile` passing in the `file` name
   *
   * @param {string} file
   * @returns {void}
   */
  selectFile(file: string): void {
    this.$emit('selectFile', file)
  }

  /**
   * Returns the status about whether a hunk id is in the list of selected ids
   *
   * @param {number} id
   * @returns {void}
   */
  isHunkSelected(id: number): boolean {
    return this.selectedHunkIds.includes(id)
  }

  /**
   * Emits an event by the name `selectFileIfAllHunksSelected` passing in the `file` name and `id`
   *
   * @param {string} file
   * @param {number} id
   * @returns {void}
   */
  selectFileIfAllHunksSelected(file: string, id: number): void {
    this.$emit('selectFileIfAllHunksSelected', file, id)
  }
}
</script>
