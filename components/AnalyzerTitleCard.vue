<template>
  <div class="px-2 py-2 bg-ink-100 rounded-sm bg-ink-400 flex items-center space-x-2 cursor-pointer"
        @click="handleClick()">
    <z-icon :icon="icon" size="small" color="honey"></z-icon>
    <div class="flex-1 text-sm text-vanilla-200 font-bold">{{name}}</div>
    <z-icon icon="plus" size="small" class="cursor-pointer" color="vanilla-200"></z-icon>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';
import { ZIcon } from '@deepsourcelabs/zeal';
@Component({
    components: {
       ZIcon 
    }
})
export default class AnalyzerTitleCard extends Vue {
    @Prop({default: 'globe'})
    icon!: string
    @Prop({default: ''})
    name!: string
    public handleClick(event: Event): void {
        this.$emit('click', event)
    }
}
</script>
