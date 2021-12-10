<template>
  <div class="p-4">
    <empty-state
      title="Policies are coming soon"
      subtitle="We hear that you need policies in your DeepSource Enterprise Installation and we are working to bring it to you."
      :webp-image-path="require('~/assets/images/ui-states/control-panel/coming-soon.webp')"
      :png-image-path="require('~/assets/images/ui-states/control-panel/coming-soon.png')"
    />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'

@Component({
  layout: 'control-panel'
})
export default class ControlPanelPolicies extends mixins(ControlPanelBaseMixin) {}
</script>
