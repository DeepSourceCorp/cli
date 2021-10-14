<template>
  <!-- Description -->
  <div class="flex-col hidden w-2/6 px-4 xl:flex">
    <div class="text-sm font-medium tracking-wider uppercase text-vanilla-100">Description</div>
    <div class="text-sm prose text-vanilla-400">
      <p v-html="description"></p>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import ShowMore from '@/components/ShowMore.vue'

@Component({
  components: {
    ShowMore
  }
})
export default class IssueDescription extends Vue {
  @Prop()
  description: string
}
</script>
