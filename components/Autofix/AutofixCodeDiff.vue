<template>
  <div class="flex flex-col space-y-4">
    <!-- Code -->
    <div
      v-for="(change, name) in changeSet"
      :key="name"
      class="code relative flex flex-col border border-ink-200 rounded-sm"
    >
      <div
        v-if="isGroup"
        class="absolute w-6 h-0.5 bg-juniper transform -translate-x-full top-4"
      ></div>
      <!-- title -->
      <div class="bg-ink-300 p-2 text-sm flex items-center space-x-1 border-b border-ink-200">
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
          class="font-medium flex-1"
          :class="{
            'text-cherry': change.patches && change.patches[0].action === 'deleted',
            'text-vanilla-400': change.patches && change.patches[0].action === 'modified'
          }"
          >{{ name }}</span
        >
        <!-- Issue Labels for showing the issues that are related to a patch -->
        <span v-if="isGeneratedFromPr">
          <template v-if="change.issues && change.issues.length > 3">
            <span
              v-for="num in 3"
              :key="num"
              v-tooltip="change.issues[num - 1].title"
              class="text-sm text-vanilla-100"
              >{{ change.issues[num - 1] && change.issues[num - 1].shortcode.toUpperCase() }}</span
            >
          </template>
          <template v-else>
            <template v-for="issue in change.issues">
              <span v-tooltip="issue.title" :key="issue.shortcode" class="text-sm text-vanilla-100">
                {{ issue.shortcode.toUpperCase() }}
              </span>
            </template>
          </template>
          <template v-if="change.issues && change.issues.length > 3">
            <span>+ {{ change.issues.length - 3 }} more</span>
          </template>
        </span>
      </div>
      <!-- Editor -->
      <div
        v-for="(code, index) in change.patches"
        :key="code.id"
        class="flex w-full"
        :class="{ 'border-b-2 border-ink-200': index !== change.patches.length - 1 }"
      >
        <div
          class="bg-ink-300 flex items-start pt-4"
          :class="{
            'pl-2': !isReadOnly && code.action === 'modified' && code.action !== 'deleted'
          }"
        >
          <z-checkbox
            v-if="!isReadOnly && code.action === 'modified' && code.action !== 'deleted'"
            v-model="selectedHunkIds"
            @change="selectFileIfAllHunksSelected(name, code.id)"
            :value="code.id"
            size="small"
            fontSize="base"
            spacing="4"
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
        <template v-else>
          <div
            class="after_html w-1/2 border-r border-ink-200"
            :class="{
              'bg-ink-300 opacity-20': !isHunkSelected(code.id)
            }"
          >
            <z-code :content="code.before_html"></z-code>
          </div>
          <div
            class="before_html w-1/2"
            :class="{
              'bg-ink-300 opacity-20': !isHunkSelected(code.id)
            }"
          >
            <z-code :content="code.after_html"></z-code>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZCheckbox, ZCode } from '@deepsourcelabs/zeal'
import { Maybe, Scalars } from '~/types/types'

@Component({
  components: {
    ZCheckbox,
    ZCode
  }
})
export default class AutofixCodeDiff extends Vue {
  @Prop()
  code!: Array<Record<string, string>>

  @Prop()
  isGroup!: boolean

  @Prop()
  changeSet!: Maybe<Scalars['GenericScalar']>

  @Prop()
  selectedFiles!: Array<string>

  @Prop()
  isReadOnly!: boolean

  @Prop()
  selectedHunkIds!: Array<string>

  @Prop()
  isGeneratedFromPr!: boolean

  public isChecked = false

  public selectFile(file: string): void {
    this.$emit('selectFile', file)
  }

  public isHunkSelected(id: string): boolean {
    return this.selectedHunkIds.includes(id)
  }

  public selectFileIfAllHunksSelected(file: string, id: string): void {
    this.$emit('selectFileIfAllHunksSelected', file, id)
  }
}
</script>
