<template>
  <div class="p-4 space-y-6">
    <h2 class="text-lg font-medium">Organization details</h2>
    <form-group>
      <text-input label="Name" input-id="team-settings-branch" v-model="teamName"></text-input>
      <image-input
        label="Logo"
        button-label="Update Logo"
        input-id="team-settings-logo"
        :value="teamlogo"
      ></image-input>
    </form-group>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { TextInput, ImageInput, FormGroup } from '~/components/Form'

@Component({
  components: {
    TextInput,
    ImageInput,
    FormGroup
  },
  layout: 'dashboard'
})
export default class GeneralSettings extends Vue {
  private teamName = 'DeepSource HQ'
  private teamlogo = 'https://shivam.dev/vue.svg'
}
</script>
