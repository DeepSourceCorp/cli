<template>
  <main class="relative flex flex-col min-h-screen">
    <img
      class="w-auto h-6 mx-auto my-12 md:my-24"
      src="~/assets/images/logo-wordmark-white.svg"
      alt="DeepSource"
    />
    <div class="relative grid items-start justify-center flex-grow">
      <div
        class="max-w-lg p-6 mx-2 space-y-5 border rounded-lg w-120 bg-ink-400 border-ink-100 sm:p-10 sm:mx-0"
      >
        <h1 class="text-2xl font-bold leading-snug text-vanilla-100">Frontend health report</h1>
        <div class="flex items-center justify-between">
          <span>Frontend</span>
          <div class="p-px rounded-full bg-juniper">
            <z-icon icon="check" class="stroke-2.5" color="ink-400" />
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span>GraphQL client</span>
          <div v-if="$fetchState.pending" class="p-px">
            <z-icon icon="spin-loader" class="stroke-2.5 animate-spin" color="ink-400" />
          </div>
          <div
            v-else-if="isApolloClientUp && isApolloConnectionWorking"
            class="p-px rounded-full bg-juniper"
          >
            <z-icon icon="check" class="stroke-2.5" color="ink-400" />
          </div>
          <div v-else class="p-px rounded-full bg-cherry">
            <z-icon icon="x" class="stroke-2.5" color="ink-400" />
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span>Websocket connection</span>
          <div v-if="isWebsocketUp" class="p-px rounded-full bg-juniper">
            <z-icon icon="check" class="stroke-2.5" color="ink-400" />
          </div>
          <div v-else class="p-px rounded-full bg-cherry">
            <z-icon icon="x" class="stroke-2.5" color="ink-400" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'
import gql from 'graphql-tag'
import { Context } from '@nuxt/types'

/**
 * Health Probe Page
 */
@Component({
  components: {
    ZIcon
  },
  middleware: [
    async function ({ error, $fetchGraphqlData }: Context): Promise<void> {
      try {
        await $fetchGraphqlData(
          gql`
            query {
              analyzers {
                totalCount
              }
            }
          `,
          null,
          true,
          false
        )
      } catch (e) {
        error({ statusCode: 500 })
      }
    }
  ]
})
export default class Health extends Vue {
  isApolloConnectionWorking = false
  isWebsocketUp = false
  isApolloClientUp = false

  /**
   * Fetch hook
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.makeAnalyzerRequest()
  }

  /**
   * Query analyzers to check graphql query
   *
   * @return {Promise<void>}
   */
  async makeAnalyzerRequest(): Promise<void> {
    await this.$fetchGraphqlData(
      gql`
        query {
          analyzers {
            totalCount
          }
        }
      `,
      null,
      true,
      false
    )

    this.isApolloConnectionWorking = true
  }

  /**
   * Mounted hook
   *
   * @return {any}
   */
  mounted() {
    this.$socketManager.ready().then(() => {
      this.isWebsocketUp = this.$socketManager.ws.readyState === 1
    })
    this.isApolloClientUp = this.$apollo.getClient() !== null
  }
}
</script>
