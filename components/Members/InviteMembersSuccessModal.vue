<template>
  <z-modal title="Invitation sent" @onClose="$emit('close')">
    <div class="flex flex-col items-center px-4 py-8">
      <video
        autoplay
        muted
        disablepictureinpicture
        :poster="require('~/assets/images/ui-states/owner/invite-success-136px.png')"
        class="mx-auto max-h-84"
      >
        <source src="~/assets/images/ui-states/owner/invite-sent-136px.webm" type="video/webm" />
      </video>
      <span class="font-semibold text-vanilla-100 text-center">Invitation sent successfully!</span>
      <p class="max-w-sm mt-4 text-sm leading-6 text-center text-vanilla-400">
        We've sent an email to your team member(s) with a link to join the team. You can ask them to
        check their inbox.
      </p>
      <z-button size="small" icon="user-plus" class="mt-6" @click="$emit('invite-more')">
        Invite new member
      </z-button>
    </div>
  </z-modal>
</template>
<script lang="ts">
import { ZModal, ZButton } from '@deepsource/zeal'
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
