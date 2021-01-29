<template>
  <div class="relative h-72 min-h-1/2 md:h-40 bg-ink-400 p-2 rounded-sm flex flex-col space-y-3 md:min-w-1/2 md:w-1/2 box-border overflow-scroll"
        :class="{ 'justify-center items-center space-y-2': configList.length }">
    <!-- Header -->
    <div v-if="configList.length > 0" class="flex w-full items-center space-x-2">
        <z-icon :icon="icon" size="small" color="robin"></z-icon>
        <!-- TODO: Get Repo name and handle name -->
        <div class="flex-1 text-sm text-vanilla-200 font-bold">
            {{ name }}
        </div>
        <div class="cursor-pointer" @click="handleClick">
            <z-icon icon="x"
                size="small" 
                color="vanilla-200">
            </z-icon>
        </div>
    </div>
    <!-- Config Section -->
    <template v-for="config in configList">
        <div :key="config.title" class="flex flex-col space-y-2">
            <div class="text-xs tracking-wide text-slate uppercase">
                {{config.title}}
            </div>
            <div v-if="config.type == 'boolean'">
                <z-radio-group v-model="config.selected" class="flex space-x-4 text-xs">
                    <z-radio v-for="option in config.values" 
                            :key="option.value"
                            :value="option.value"
                            :label="option.label"
                            ></z-radio>
                </z-radio-group>
            </div>
            <div v-else-if="config.type == 'input'">
                <z-input v-model="config.selected" 
                        textSize="xs">
                </z-input>
            </div>
            <div v-else-if="config.type == 'list'" class="h-8">
                <!-- TODO: Customizable placeholder -->
                <z-select 
                    v-model="config.selected" 
                    class="z-10" 
                    placeholder="Choose a framework">
                    <z-option
                        v-for="item in config.values"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                        <div class="flex items-center">
                            <z-icon icon="activity" size="small" class="-mt-1 mr-2"></z-icon>
                            <span class="flex-1">{{item.label}}</span>
                        </div>
                    </z-option>
                </z-select>
            </div>
        </div>
    </template>
    <!-- No Config Data Section -->
    <template v-if="configList.length == 0">
        <div class="absolute top-2 right-2 cursor-pointer" @click="handleClick">
            <z-icon icon="x"
                size="small" 
                color="vanilla-200">
            </z-icon>
        </div>
        <z-icon :icon="icon" color="pink"></z-icon>
        <div class="font-bold text-vanilla-100 text-sm">{{name}}</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator';
import { ZIcon, ZInput, ZSelect, ZOption, ZRadioGroup, ZRadio } from '@deepsourcelabs/zeal';
@Component({
    components: {
       ZIcon,
       ZInput,
       ZSelect,
       ZOption,
       ZRadioGroup,
       ZRadio
    }
})
export default class AnalyzerCard extends Vue {
    @Prop({default: 'lock'})
    icon!: string
    @Prop({default: ''})
    name!: string
    @Prop({default: []})
    configList!: Array<Record<string, unknown>>
    public handleClick(event: Event): void {
        this.$emit('click', event)
    }
}
</script>
