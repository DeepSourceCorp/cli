<template>
  <div
    class="flex gap-3 rounded-md border border-robin-500 border-opacity-10 bg-robin-500 bg-opacity-5 p-4 text-robin-300"
  >
    <z-accordion>
      <z-accordion-item is-open>
        <template #title="{ toggleAccordion, open }">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium leading-3 text-robin-400">
              Estimated response time varies based on your support tier.
            </span>
            <button
              class="-my-1.5 -mr-1.5 rounded-sm p-1.5 hover:bg-robin-500 hover:bg-opacity-10 focus:bg-robin-500 focus:bg-opacity-10"
              @click="toggleAccordion"
            >
              <z-icon :icon="open ? 'minimize-2' : 'maximize-2'" color="robin-300" size="x-small" />
            </button>
          </div>
        </template>
        <p class="mt-1.5 text-xs leading-6 text-robin-150">
          {{ supportTierCopy }} tier support is available within our user community and officially
          by the team on a best efforts basis, although we cannot guarantee a response time.
        </p>
      </z-accordion-item>
    </z-accordion>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZAccordion, ZAccordionItem, ZIcon } from '@deepsource/zeal'

@Component({ name: 'BestEffortSupport', components: { ZAccordion, ZAccordionItem, ZIcon } })
export default class BestEffortSupport extends Vue {
  @Prop({ type: String, required: true })
  supportTierCopy: string
}
</script>
