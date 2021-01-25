<template>
  <div class="flex items-center py-2 gap-x-2 cursor-pointer hover:bg-ink-300">
    <z-icon :icon="icon"></z-icon>
    <div class="flex-1 text-xs sm:text-sm md:text-base">{{ handleName }}/{{ repoName }}</div>
    <z-icon :icon="language" color="robin"></z-icon>
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
export default class RepoListItem extends Vue {
    @Prop({default: 'globe'})
    icon!: string
    @Prop({default: ''})
    repoName!: string
    @Prop({default: ''})
    handleName!: string
    @Prop({default: 'aperture'})
    language!: string
}
</script>
