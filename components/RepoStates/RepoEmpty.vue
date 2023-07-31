<template>
  <base-state title="No code found in the repository">
    <template #hero>
      <img
        :src="require('~/assets/images/ui-states/repo/empty.svg')"
        alt="Repo Empty"
        class="mx-auto mb-4"
      />
    </template>

    This repository seems to be empty. Please add code and check back later.
  </base-state>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

@Component({
  name: 'RepoEmpty'
})
export default class RepoEmpty extends Vue {}
</script>
