<template>
  <!-- Description -->
  <div class="hidden xl:flex flex-col w-2/6 px-4">
    <div class="text-vanilla-100 font-medium text-sm tracking-wider uppercase">Description</div>
    <show-more class="prose">
      <p v-html="description"></p>
    </show-more>
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
