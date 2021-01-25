<template>
    <div class="mx-auto h-screen w-screen text-vanilla-100 flex">
       <!-- Left section -->
        <div class="w-full xl:w-7/12 bg-ink-400 flex flex-col justify-center items-center">
            <div class="p-6 md:p-0 flex flex-col h-full md:h-auto w-full overflow-scroll md:overflow-hidden items-center justify-center md:w-3/5 2xl:gap-y-16 sm:gap-y-8 gap-y-8">
                <div class="hidden lg:block w-full">
                    <z-stepper :active="3">
                        <z-step title="Step 1" description="Connect Provider"></z-step>
                        <z-step title="Step 2" description="Set Preferences"></z-step>
                        <z-step title="Step 3" description="Pick a repository"></z-step>
                    </z-stepper>
                </div>
                <p class="text-base text-vanilla-300 text-left w-full">Pick the repository that you would like to run your first analysis on.</p>
                <div class="h-auto md:h-full flex flex-col gap-y-3 w-full">
                    <z-input v-model="repoName"
                            icon="search"
                            iconPosition="left"
                            placeholder="Search for a repository by name...">
                    </z-input>
                    <div class="text-vanilla-400 font-medium text-xs">
                        {{ getRepoName() }}
                    </div>
                    <!-- Repo list -->
                    <div class="overflow-scroll h-96 md:h-72 flex flex-col"
                        :class="this.repoCount == 0 ? 'space-y-3 pr-0' : 'pr-3'"> 
                        <div v-for="(repo, index) in getFilteredList()" :key="index">
                            <repo-list-item handleName="acme"
                                        :repoName="repo.name"></repo-list-item>
                            <z-divider class="mt-0 mb-0"></z-divider>
                        </div>
                        <div v-if="this.repoCount == 0" class="flex-1 text-sm text-center text-vanilla-200 border border-dashed border-slate p-6 flex w-full justify-center items-center">
                            We couldn’t find any matches for "{{this.repoName}}". <br/>
                            Double check your search for any typos or spelling errors.
                        </div>
                        <!-- Sync Repo Notice -->
                        <div v-if="this.repoCount < this.repoList.length" class="rounded-md border-4 border-solid border-aqua border-b-0 border-l-0 border-r-0 bg-ink-300 py-2 px-4 w-full text-xs sm:text-sm leading-5">
                            Can’t find the repository you’re looking for? Try <z-button to="#" color="link">syncing them</z-button>.<br/><br/>
                            Some repositories may not be visible if you do not have access to them. You can <z-button to="#" color="link">configure your permissions</z-button> to see all repositories.
                        </div>
                    </div>
                </div>
                <div class="w-full fixed md:static bottom-0 left-0">
                    <z-button color="primary" 
                        class="w-full rounded-none p-4 sm:p-2"
                        disabled>Start Analysis</z-button>
                </div>
            </div>
        </div>
        <!-- Right section -->   
        <div class="hidden w-5/12 bg-ink-300 xl:flex flex-row-reverse items-center">
            <div class="bg-ink-200 w-11/12 h-96 flex">
                <div class="flex flex-col space-y-4 h-full p-4 w-2/5 border-r border-ink-100">
                    <!-- Avatar and header -->
                    <div class="flex items-center space-x-2">
                        <!-- Avatar Component -->
                        <!-- TODO: Dummy Image URL, later will render from API/Store -->
                        <z-avatar
                            image="https://randomuser.me/api/portraits/women/24.jpg"
                            :user-name="userName"
                            size="md">
                        </z-avatar>
                        <!-- Handle Name -->
                        <div class="flex items-center space-x-1 font-medium text-base text-vanilla-200 cursor-pointer">
                            {{ userName }}
                            <z-icon icon="chevron-down" size="small" color="vanilla-200"></z-icon>
                        </div>
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
                        <div v-for="tab in tabs" 
                            :key="tab.name"
                            class="text-vanilla-400 flex-1 pb-0.5 border-b"
                            :class="tab.active ? 'border-juniper' : 'border-ink-100'">
                            {{ tab.name }}
                        </div>
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
import RepoListItem from '@/components/RepoListItem.vue';

// TODO: Define a proper type in types folder based on API response
interface Repo {
    name: string;
}

@Component({
  components: {
    ZButton,
    ZStepper,
    ZStep,
    ZInput,
    RepoListItem,
    ZDivider,
    ZAvatar,
    ZIcon
  }
})
export default class ChooseRepo extends Vue {
    private repoName = ''
    // TODO: This will be from the API/Store once the user signs in
    public userName = "Ruphaa"
    public handleName = "Acme";
    private tabs: Array<Record<string, unknown>> = [{
                                                        name: "Overview",
                                                        active: false
                                                    }, {
                                                        name: "Issues",
                                                        active: true
                                                    }, {
                                                        name: "Autofixes",
                                                        active: false
                                                    }]
    // TODO: This repo list will come from an API
    private repoList: Array<Repo> = [{name: "marvin"},
                                                        {name: "asgard"},
                                                        {name: "marvin-python"},
                                                        {name: "first-release"},
                                                        {name: "asgard"},
                                                        {name: "asgard-office"},
                                                        {name: "second-release"},
                                                        {name: "zeal"},
                                                        {name: "bifrost"},
                                                        {name: "citadel"},
                                                        {name: "jupiter"},
                                                        {name: "siri"},
                                                        {name: "titanic"},
                                                        {name: "marvin-beta"},
                                                        {name: "marvin-release"}]; 
    private repoCount: number = this.repoList.length; 

    getRepoName(): string {
        if(this.repoName) {
            return `${this.repoCount} repositories found for "${this.repoName}"`;
        } 
        return `${this.repoCount} repositories available`

    }
    // TODO: Search Implementation will be changed later using API
    getFilteredList(): Array<Repo> {
        if(!this.repoName) {
            this.repoCount = this.repoList.length;
            return this.repoList;
        }
        const searchTerm = this.repoName.trim().toLowerCase()
        let filteredList: Array<Repo> = [];
        filteredList = this.repoList.filter((repo) => repo.name.toLowerCase().includes(searchTerm))
        this.repoCount = filteredList.length;
        return filteredList
    }
}
</script>

