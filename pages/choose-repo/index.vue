<template>
    <div class="mx-auto h-screen w-screen text-vanilla-100 flex">
       <!-- Left section -->
        <div class="w-full xl:w-7/12 bg-ink-400 flex flex-col justify-center items-center">
        </div>
        <!-- Right section -->   
        <div class="hidden w-5/12 bg-ink-300 xl:flex flex-row-reverse items-center">
            <div class="bg-ink-200 w-11/12 h-96 flex">
                <div class="flex flex-col space-y-4 h-full p-4 w-2/5 border border-solid border-l-0 border-t-0 border-b-0 border-ink-100">
                    <!-- Avatar and header -->
                    <div class="flex items-center space-x-2">
                        <!-- Avatar Component -->
                        <div class="bg-juniper p-4 rounded-full"></div>
                        <!-- Handle Name -->
                        <div class="flex items-center space-x-1 font-medium text-base text-vanilla-200 cursor-pointer">Ruphaa<z-icon icon="chevron-down" size="small" color="vanilla-200"></z-icon></div>
                    </div>
                    <!-- Blank space -->
                    <div class="w-full p-10 bg-ink-100"></div>
                    <!-- Start analysing menu -->
                    <div class="flex space-x-1">
                        <z-icon icon="activity" size="small"></z-icon>
                        <div class="text-xs flex-1">Actively analyzing</div>
                        <z-button color="primary" icon="plus" iconColor="ink-400" iconSize="small"></z-button>
                    </div>
                    <!-- Placeholders - Subtree - Repo list -->
                    <div class="ml-5 p-3 bg-ink-100 w-9/12"></div>
                    <div class="p-6 bg-ink-100"></div>
                </div>
                <div class="p-4 w-3/5 h-full flex flex-col space-y-6">
                    <!-- Repo heading -->
                    <div class="text-vanilla-400">{{ handleName }} /<span class="ml-2 px-16 bg-ink-100"></span></div>
                    <!-- placeholder -->
                    <div class="p-3 bg-ink-100 w-full"></div>
                    <!-- Tab Component -->
                    <div class="flex text-center">
                        <div class="text-vanilla-400 flex-1 pb-0.5 border border-solid border-t-0 border-l-0 border-r-0 border-ink-100 ">Overview</div>
                        <div class="text-vanilla-400 flex-1 pb-0.5 border border-solid border-t-0 border-l-0 border-r-0 border-juniper">Issues</div>
                        <div class="text-vanilla-400 flex-1 pb-0.5 border border-solid border-t-0 border-l-0 border-r-0 border-ink-100 ">Autofixes</div>
                    </div>
                    <!-- placeholder -->
                    <div class="p-6 bg-ink-100"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator';
import { ZButton, ZIcon, ZDivider, ZStepper, ZStep, ZInput, ZAvatar } from "@deepsourcelabs/zeal";
@Component({
  components: {
    ZButton,
    ZStepper,
    ZStep,
    ZInput,
    ZDivider,
    ZAvatar,
    ZIcon
  }
})
export default class ChooseRepo extends Vue {
    public name!: string
    handleName:string = "Acme";
}
</script>
