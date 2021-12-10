<template>
  <control-panel-invite />
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'

@Component({
  layout: 'control-panel'
})
export default class GroupInvitesHome extends mixins(ControlPanelBaseMixin) {}
</script>
