<template>
  <div>
    <button-input
      label="Cancel Plan"
      inputId="billing-settings-cancel-plan"
      buttonType="danger"
      buttonLabel="Cancel Plan"
      icon="x"
      @click="showCancelPlanModal"
    >
      <template slot="description">
        Deleting this organization will permanently delete the deepsource.toml from your
        repositories.
        <a href="#" class="text-juniper hover:underline">Learn more.</a>
      </template>
    </button-input>
    <portal to="modal">
      <z-confirm
        v-if="showConfirmDialog"
        primaryActionType="danger"
        primaryActionLabel="Yes, cancel my plan"
        secondaryActionLabel="I changed my mind"
        title="Are you sure you want to cancel your DeepSource subscription"
        :subtitle="message"
        @primaryAction="removeMember"
        @onClose="close"
      >
      </z-confirm>
    </portal>
  </div>
</template>
<script lang="ts">
import { mixins, Component } from 'nuxt-property-decorator'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import SubscriptionMixin from '~/mixins/subscriptionMixin'
import { ZIcon, ZConfirm } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon,
    ZConfirm
  }
})
export default class CancelPlan extends mixins(OwnerDetailMixin, SubscriptionMixin) {
  showConfirmDialog = false
  message = `Your team will be downgraded to analysis on only 3 private repositories, and all other members except up to 3 recently active members will be converted to contributors`

  showCancelPlanModal() {
    this.showConfirmDialog = true
  }

  close() {
    this.showConfirmDialog = false
  }
}
</script>
