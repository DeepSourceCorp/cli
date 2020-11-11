<template>
  <div class="container mx-auto mt-10">
    <span class="text-xl">Analysis run list</span>
    <nuxt-link
      v-for="run in runList.edges"
      :key="run.node.id"
      to="/dummy/run"
      class="border p-2 my-2 cursor-pointer hover:bg-ink-100 hover:text-vanilla-100 block"
    >
      {{ run.node.runId }}/{{ run.node.branchName }}
    </nuxt-link>

    <span class="text-xl">Autofix run list</span>
    <nuxt-link
      v-for="run in autofixRunList.edges"
      :key="run.node.id"
      to="/dummy/autofix-run"
      class="border p-2 my-2 cursor-pointer hover:bg-ink-100 hover:text-vanilla-100 block"
    >
      {{ run.node.runId }}/{{ run.node.branchName }}
    </nuxt-link>

    <span class="text-xl mt-4">Transformer run list</span>
    <nuxt-link
      v-for="run in transformerRunList.edges"
      :key="run.node.id"
      to="/dummy/transformer-run"
      class="border p-2 my-2 cursor-pointer hover:bg-ink-100 hover:text-vanilla-100 block"
    >
      {{ run.node.runId }}/{{ run.node.branchName }}
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ACT_FETCH_RUN_LIST, ACT_FETCH_AUTOFIX_RUN_LIST, ACT_FETCH_TRANSFORMER_RUN_LIST } from '~/types/action-types'
import { Component, namespace } from 'nuxt-property-decorator'
import { AutofixRunConnection, RunConnection, TransformerRunConnection } from '~/types/types'

const runList = namespace('runList')
const autofixRunList = namespace('autofixRunList')
const transformerRunList = namespace('transformerRunList')

@Component
export default class History extends Vue {
  @runList.State
  runList!: RunConnection

  @autofixRunList.State
  autofixRunList!: AutofixRunConnection

  @transformerRunList.State
  transformerRunList!: TransformerRunConnection

  created() {
    this.$store.dispatch(`runList/${ACT_FETCH_RUN_LIST}`, {
      provider: 'GITHUB',
      owner: 'deepsourcelabs',
      name: 'bifrost',
      after: 'String',
      limit: 20
    })

    this.$store.dispatch(`autofixRunList/${ACT_FETCH_AUTOFIX_RUN_LIST}`, {
      provider: 'GITHUB',
      owner: 'deepsourcelabs',
      name: 'bifrost',
      after: 'String',
      limit: 20
    })

    this.$store.dispatch(`transformerRunList/${ACT_FETCH_TRANSFORMER_RUN_LIST}`, {
      provider: 'GITHUB',
      owner: 'deepsourcelabs',
      name: 'bifrost',
      after: 'String',
      limit: 20
    })
  }
}
</script>
