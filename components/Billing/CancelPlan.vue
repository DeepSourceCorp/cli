<template>
  <div>
    <button-input
      label="Cancel subscription"
      input-id="billing-settings-cancel-plan"
      button-type="danger"
      button-label="Cancel subscription"
      icon="x"
      @click="showCancelPlanModal = true"
    >
      <template #description>
        Cancelling your subscription will downgrade analysis to only 1 private repository, and all
        the other members except up to 3 recently active members will be converted to contributors.
        <a
          href="/pricing"
          target="_blank"
          rel="noopener noreferrer"
          class="text-juniper hover:underline"
          >Learn more.</a
        >
      </template>
    </button-input>
    <portal v-if="showCancelPlanModal" to="modal">
      <cancel-plan-modal @close="showCancelPlanModal = false" />
    </portal>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import CancelPlanModal from './Modals/CancelPlanModal.vue'

@Component({
  components: {
    CancelPlanModal
  }
})
export default class CancelPlan extends Vue {
  private showCancelPlanModal = false
}
</script>
