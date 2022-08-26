<template>
  <z-modal title="Invitation sent" @onClose="$emit('close')">
    <div class="flex flex-col items-center px-4 py-8">
      <img src="~/assets/images/ui-states/owner/invite-success.svg" class="w-20 h-20 mx-auto" />
      <p class="max-w-sm mt-4 text-sm leading-6 text-center text-vanilla-400">
        We have sent an invite email to your team member(s). They can create an account using the
        link in the email and join your team.
      </p>
      <z-button size="small" icon="user-plus" class="mt-6" @click="$emit('invite-more')">
        Invite new member
      </z-button>
    </div>
  </z-modal>
</template>
<script lang="ts">
import { ZModal, ZButton } from '@deepsourcelabs/zeal'
import { Vue, Component } from 'nuxt-property-decorator'

/**
 * Invite members success modal
 */
@Component({
  components: {
    ZModal,
    ZButton
  }
})
export default class InviteMembersSuccessModal extends Vue {}
</script>
