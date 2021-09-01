<template>
  <div>
    <div class="grid grid-cols-9 gap-4">
      <div class="col-span-4">
        <label for="test-file-pattern" class="text-sm font-medium text-vanilla-100"
          >Tests file patterns</label
        >
        <p class="pr-0 text-xs font-medium text-vanilla-400 xl:pr-10 lg:pr-8 md:pr-5">
          Glob patterns of the test files. This helps us reduce false positives.
          <a
            v-if="vcsUrl"
            :href="vcsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-juniper hover:underline"
            >(view repo)</a
          >
        </p>
      </div>
      <div class="col-span-5">
        <textarea
          v-model="testPatternsModel"
          name="test-file-pattern"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          class="w-full font-mono h-full p-2 text-xs bg-transparent border outline-none resize-none min-h-20 border-ink-200 text-vanilla-200"
          placeholder="test/**
integration_tests/tests_*.py
**/*_test.go"
        ></textarea>
      </div>
    </div>
    <div class="grid grid-cols-9 gap-4">
      <div class="col-span-4">
        <label for="exlude-file-pattern" class="text-sm font-medium text-vanilla-100"
          >Excluded file patterns</label
        >
        <p class="pr-0 text-xs font-medium text-vanilla-400 xl:pr-10 lg:pr-8 md:pr-5">
          Glob patterns of files that should not be analyzed such as auto-generated files,
          migrations, compatibility files.
        </p>
      </div>
      <div class="col-span-5">
        <textarea
          v-model="excludePatternsModel"
          name="exlude-file-pattern"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          class="w-full font-mono h-full p-2 text-xs bg-transparent border outline-none resize-none min-h-20 border-ink-200 text-vanilla-200"
          placeholder="migrations/**
/dist/*min.js"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'

@Component({})
export default class PatternSelector extends Vue {
  @Prop({ default: () => [] })
  testPatterns: string[]

  @Prop({ default: () => [] })
  excludePatterns: string[]

  @Prop({ default: '' })
  vcsUrl: string

  public testPatternsModel = ''
  public excludePatternsModel = ''

  mounted(): void {
    this.testPatternsModel = this.testPatterns.join('\n')
    this.excludePatternsModel = this.excludePatterns.join('\n')
  }

  @Watch('testPatterns')
  updateTestPatterns(): void {
    this.testPatternsModel = this.testPatterns.join('\n')
  }

  @Watch('excludePatterns')
  updateExcludePatterns(): void {
    this.excludePatternsModel = this.excludePatterns.join('\n')
  }

  @Watch('testPatternsModel')
  @Watch('excludePatternsModel')
  updatePatterns(): void {
    this.$emit('updatePatterns', {
      test_patterns: this.testPatternsModel.split('\n'),
      exclude_patterns: this.excludePatternsModel.split('\n')
    })
  }
}
</script>
