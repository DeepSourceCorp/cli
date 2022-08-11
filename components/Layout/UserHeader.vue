<template>
  <div>
    <div class="overflow-x-auto border-b bg-ink-300 border-ink-200">
      <div id="header" class="flex items-center p-4">
        <h2 class="inline-flex items-center space-x-4 font-medium text-vanilla-100">
          <nuxt-link class="inline-flex items-center flex-shrink-0 space-x-2" to="/me">
            <!-- account avatar -->
            <z-avatar
              v-if="viewer.avatar"
              :image="viewer.avatar"
              :fallback-image="getDefaultAvatar(viewer.email)"
              :user-name="viewer.login"
              stroke="bg-ink-100 p-1.5"
              class="flex-shrink-0"
            />

            <!-- account display name -->
            <span class="text-xl font-semibold cursor-pointer lg:text-xl xl:text-2xl">{{
              viewer.fullName || viewer.firstName || viewer.email
            }}</span>
          </nuxt-link>
        </h2>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZTag, ZAvatar, ZAvatarGroup } from '@deepsourcelabs/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin from '~/mixins/authMixin'

import { getDefaultAvatar } from '~/utils/ui'

/**
 * Header for the user layout
 */
@Component({
  components: {
    ZIcon,
    ZTag,
    ZAvatar,
    ZAvatarGroup
  },
  methods: { getDefaultAvatar }
})
export default class UserHeader extends mixins(ActiveUserMixin, AuthMixin) {}
</script>
