<template>
  <!-- Description -->
  <div class="hidden lg:block">
    <div class="px-4 text-sm font-medium tracking-wider uppercase text-vanilla-100">
      Description
    </div>
    <div class="px-4 prose-sm prose break-words text-vanilla-400">
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
