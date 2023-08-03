<template>
  <!-- Description -->
  <div class="hidden space-y-3 lg:block">
    <div class="px-4 text-sm font-medium uppercase tracking-wider text-vanilla-100">
      Description
    </div>
    <div class="prose-issue-description break-words px-4">
      <p v-html="description"></p>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class IssueDescription extends Vue {
  @Prop()
  description: string
}
</script>
