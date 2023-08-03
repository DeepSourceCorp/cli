<template>
  <main class="relative flex min-h-screen flex-col">
    <img
      class="mx-auto my-12 h-6 w-auto md:my-24"
      src="~/assets/images/logo-wordmark-white.svg"
      alt="DeepSource"
    />
    <div class="relative grid flex-grow items-start justify-center">
      <div
        class="mx-2 w-120 max-w-lg space-y-5 rounded-lg border border-slate-400 bg-ink-400 p-6 sm:mx-0 sm:p-10"
      >
        <h1 class="text-2xl font-bold leading-snug text-vanilla-100">Frontend health report</h1>
        <div class="flex items-center justify-between">
          <span>Frontend</span>
          <div class="rounded-full bg-juniper p-px">
            <z-icon icon="check" class="stroke-2.5" color="ink-400" />
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span>GraphQL client</span>
          <div v-if="$fetchState.pending" class="p-px">
            <z-icon icon="spin-loader" class="animate-spin stroke-2.5" color="ink-400" />
          </div>
          <div
            v-else-if="isApolloClientUp && isApolloConnectionWorking"
            class="rounded-full bg-juniper p-px"
          >
            <z-icon icon="check" class="stroke-2.5" color="ink-400" />
          </div>
          <div v-else class="rounded-full bg-cherry p-px">
            <z-icon icon="x" class="stroke-2.5" color="ink-400" />
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span>Websocket connection</span>
          <div v-if="isWebsocketUp" class="rounded-full bg-juniper p-px">
            <z-icon icon="check" class="stroke-2.5" color="ink-400" />
          </div>
          <div v-else class="rounded-full bg-cherry p-px">
            <z-icon icon="x" class="stroke-2.5" color="ink-400" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import gql from 'graphql-tag'
import { Context } from '@nuxt/types'

/**
 * Health Probe Page
 */
@Component({
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
