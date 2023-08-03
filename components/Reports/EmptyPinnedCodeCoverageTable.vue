<template>
  <div class="pointer-events-none relative rounded-md">
    <div class="absolute inset-0 z-10 mx-auto grid place-content-center rounded-md">
      <p class="text-center text-sm text-vanilla-400">{{ subtitle }}</p>
    </div>
    <code-coverage-table
      :linked-rows="true"
      :repo-coverage-list="tableData"
      class="blur-table opacity-60 no-filter:opacity-10"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * Component to show empty code coverage table
 */
@Component({
  name: 'EmptyPinnedCodeCoverageTable'
})
export default class EmptyPinnedCodeCoverageTable extends Vue {
  @Prop({ default: 'Not enough data' })
  subtitle: string

  tableData = Array.from({ length: 7 }).map((_, idx) => {
    const booleanOptions = [true, false]

    return {
      name: `repo-${idx + 1}`,
      lcvValue: this.generateRandomValue(100), // Generate a random number below `100`,
      lcvIsPassing: booleanOptions[this.generateRandomValue()], // Choose between `true`/`false` at random,
      bcvValue: this.generateRandomValue(100), // Generate a random number between `100`,
      bcvIsPassing: booleanOptions[this.generateRandomValue()] // Choose between `true`/`false` at random
    }
  })

  /**
   * Generate a random value in the range below the `multiplier`
   *
   * @param {number} [multiplier=1]
   * @returns {void}
   */
  generateRandomValue(multiplier = 1) {
    return Math.round(Math.random() * multiplier)
  }
}
</script>

<style scoped>
.blur-table {
  filter: blur(0.5rem);
}
</style>
