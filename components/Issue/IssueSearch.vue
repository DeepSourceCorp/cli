<template>
  <div
    class="flex-grow transition-all ease-in-out"
    :class="
      expandOnFocus && (searchFocused || modelValue)
        ? 'md:w-84 duration-150'
        : 'md:w-44 duration-200'
    "
  >
    <z-input
      :value="modelValue"
      size="small"
      class="text-sm"
      background-color="ink-300"
      :placeholder="placeholder"
      :show-border="false"
      @focus="searchFocused = true"
      @blur="searchFocused = false"
      @debounceInput="(val) => (modelValue = val)"
    >
      <template slot="left">
        <z-icon class="flex-shrink-0 p-px" icon="search" size="small"></z-icon>
      </template>
      <template slot="right">
        <z-icon
          icon="x"
          size="small"
          class="cursor-pointer"
          v-show="modelValue"
          @click="modelValue = null"
        ></z-icon>
      </template>
    </z-input>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ModelSync, Prop } from 'vue-property-decorator'
import { ZIcon, ZInput } from '@deepsource/zeal'

@Component({
  components: {
    ZIcon,
    ZInput
  }
})
export default class IssueSearch extends Vue {
  @ModelSync('searchCandidate', 'updateSearch', { type: String, default: null })
  readonly modelValue: string

  @Prop({ default: 'Search for issue or file' })
  placeholder: string

  @Prop({ default: true })
  expandOnFocus: boolean

  private searchFocused = false
}
</script>
