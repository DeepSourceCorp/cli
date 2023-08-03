<template>
  <z-accordion class="p-4 pb-0">
    <z-accordion-item
      :span-custom-height="true"
      custom-max-height="max-h-full"
      @isOpen="isOpenHandler"
    >
      <template #title="{ toggleAccordion }">
        <div class="flex cursor-pointer items-center gap-1 pb-4" @click="toggleAccordion">
          <z-icon
            icon="chevron-right"
            size="x-small"
            class="transform"
            :class="chevronIconAnimateClass"
          />
          <span class="text-xs leading-6 text-vanilla-400">
            How to send coverage reports to DeepSource?
          </span>
        </div>
      </template>

      <z-stepper :show-numbers="true" align="vertical">
        <z-step>
          <template #title>
            <p class="text-xs text-vanilla-400">
              Set up the
              <code class="bifrost-inline-code uppercase text-vanilla-100">DEEPSOURCE_DSN</code>
              environment variable.
            </p>
          </template>
          <template #description>
            <div
              class="copy-content-container h-8 max-w-2xs items-center gap-x-4 py-2 sm:max-w-none"
            >
              <code class="truncate font-mono text-xs font-normal leading-4 text-vanilla-100">
                {{ dsn }}
              </code>

              <unstyled-copy-button
                v-tooltip="'Copy DeepSource DSN'"
                :value="dsn"
                icon-size="x-small"
                class="auxillary-button text-xs text-vanilla-100"
              />
            </div>
          </template>
        </z-step>

        <z-step>
          <template #title>
            <p class="mb-2 text-xs text-vanilla-400">
              Install the
              <a
                href="https://deepsource.com/cli"
                target="blank"
                rel="noreferrer noopener"
                class="inline-flex items-center gap-x-1 text-juniper"
              >
                DeepSource CLI
                <z-icon icon="arrow-up-right" size="x-small" color="current" />
              </a>
            </p>
          </template>
          <template #description>
            <div class="flex max-w-2xs items-center gap-2 font-normal sm:max-w-none">
              <div class="h-8 w-24 flex-shrink-0">
                <z-select v-model="installationMethod" border-radius="rounded-sm" spacing="p-1.5">
                  <z-option
                    v-for="method in installationMethodList"
                    :key="method.value"
                    :label="method.label"
                    :value="method.value"
                    class="z-20"
                  />
                </z-select>
              </div>

              <div
                class="copy-content-container h-8 min-w-0 flex-grow items-center gap-x-2 py-2 sm:min-w-max"
              >
                <code class="truncate font-mono text-xs leading-3 text-vanilla-100">
                  <span class="select-none text-honey">$</span>

                  <template v-if="installationMethod === 'curl'">
                    curl
                    <span class="text-aqua-500">deepsource.io/cli</span>
                    <span class="text-honey"> | sh</span>
                  </template>

                  <template v-else>
                    brew install
                    <span class="text-aqua-500">deepsourcelabs/cli/deepsource</span>
                  </template>
                </code>

                <unstyled-copy-button
                  :value="installationCommand"
                  label="Copy"
                  icon-size="x-small"
                  class="auxillary-button text-xs text-vanilla-100"
                />
              </div>
            </div>
          </template>
        </z-step>

        <z-step>
          <template #title>
            <p class="mb-2 text-xs leading-6 text-vanilla-400">
              Report your coverage artifact to DeepSource using the CLI.
            </p>
          </template>
          <template #description>
            <div class="copy-content-container max-w-2xs items-start sm:max-w-none">
              <code
                class="line-clamp-3 max-w-md py-2 font-mono text-xs font-normal leading-4 text-vanilla-100"
              >
                {{ cliCommand }}
              </code>

              <unstyled-copy-button
                v-tooltip="'Copy CLI command'"
                :value="cliCommand"
                icon-size="x-small"
                class="auxillary-button mt-1 text-xs text-vanilla-100"
              />
            </div>

            <a
              href="https://docs.deepsource.com/docs/analyzers-test-coverage#setup-test-coverage"
              target="_blank"
              rel="noopener noreferrer"
              class="auxillary-link mt-3 h-7 w-max text-xs font-normal text-vanilla-400"
            >
              Read full documentation
              <z-icon icon="arrow-up-right" size="x-small" color="current" />
            </a>
          </template>
        </z-step>
      </z-stepper>
    </z-accordion-item>
  </z-accordion>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

interface InstallationMethod {
  label: 'cURL' | 'Homebrew'
  value: 'curl' | 'brew'
}

@Component({
  name: 'EnableCoverageSteps'
})
export default class EnabledCoverageSteps extends Vue {
  @Prop({ required: true })
  dsn: string

  chevronIconAnimateClass = ''
  installationMethod: InstallationMethod['value'] = 'curl'

  readonly cliCommand =
    './bin/deepsource report --analyzer test-coverage --key <key> --value-file <absolute-path-of-the-coverage report>'

  /**
   * Handler for the `isOpen` event emitted by `ZAccordionItem`
   *
   * @param {boolean} open
   * @returns {void}
   */
  isOpenHandler(open: boolean): void {
    this.chevronIconAnimateClass = open
      ? 'animate-first-quarter-spin rotate-90'
      : 'animate-reverse-quarter-spin rotate-0'
  }

  get installationMethodList(): Array<InstallationMethod> {
    return [
      { label: 'cURL', value: 'curl' },
      { label: 'Homebrew', value: 'brew' }
    ]
  }

  get installationCommand(): string {
    return this.installationMethod === 'curl'
      ? 'curl deepsource.io/cli | sh'
      : 'brew install deepsourcelabs/cli/deepsource'
  }
}
</script>

<style lang="postcss" scoped>
.auxillary-link {
  @apply flex cursor-pointer items-center gap-x-1.5 rounded-sm border border-ink-50 bg-ink-200 px-2 hover:bg-ink-100;
}

.copy-content-container {
  @apply flex justify-between rounded-sm border border-ink-200 bg-ink-400 pl-2.5 pr-1;
}
</style>
