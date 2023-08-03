import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZStepper from './ZStepper.vue'
import ZStep from '../ZStep/ZStep.vue'
import ZButton from '../ZButton/ZButton.vue'
import Vue from 'vue'

export default {
  title: 'Stepper',
  component: ZStepper,
  excludeStories: /.*Data$/
}

export const DefaultStepper = (): unknown =>
  Vue.extend({
    components: { ZStepper, ZStep },
    template: `<div class="container">
        <z-stepper>
            <z-step title="Step 1" description="Some description"></z-step>
            <z-step title="Step 2" description="Some description"></z-step>
            <z-step title="Step 3" description="Some description"></z-step>
        </z-stepper>
    </div>`
  })

export const VerticalStepper = (): unknown =>
  Vue.extend({
    components: { ZStepper, ZStep },
    template: `<div class="container">
        <z-stepper align="vertical">
            <z-step title="Step 1" description="Some description"></z-step>
            <z-step title="Step 2" description="Some description"></z-step>
            <z-step title="Step 3" description="Some description"></z-step>
        </z-stepper>
    </div>`
  })

export const VerticalStepperWithCustomSlots = (): unknown =>
  Vue.extend({
    components: { ZStepper, ZStep, ZButton },
    data() {
      return {
        activeIndex: 1
      }
    },
    methods: {
      nextStep() {
        if (this.activeIndex === 2) {
          this.activeIndex = 0
        } else {
          this.activeIndex = this.activeIndex + 1
        }
      }
    },
    template: `<div class="container">
        <z-stepper align="vertical" :active="activeIndex" :showNumbers="true">
            <z-step>
              <template slot="title">
                <h3 class="text-vanilla-100 text-lg font-bold">This is Step 1</h3>
              </template>
              <template v-slot:description="slotProps">
                <p class="text-vanilla-400 font-base font-normal">At this step you have to perform some action to setup your account</p>
              </slot>
            </z-step>
            <z-step>
              <template slot="title">
                <h3 class="text-vanilla-100 text-lg font-bold">This is Step 2</h3>
              </template>
              <template v-slot:description="slotProps">
                <p class="text-vanilla-400 mt-1 font-base font-normal">At this step you have to perform some action to setup your account.</p>
                <template v-if="slotProps.status == 'active'">
                  <p class="text-vanilla-400 mt-1 font-base font-normal">You're seeing this part of the step is becuase this state is currently active.</p>
                  <p class="text-vanilla-400 mt-1 font-base font-normal">Click on this button to move to the next step.</p>
                  <z-button class="mt-2" size="small" color="secondary" @clicked="nextStep">Don't Click this Button</z-button>
                </template>
              </slot>
            </z-step>
            <z-step>
              <template slot="title">
                <h3 class="text-vanilla-100 text-lg font-bold">This is Step 3</h3>
              </template>
              <template v-slot:description="slotProps">
                <p class="text-vanilla-400 font-base font-normal">At this step you have to perform some action to setup your account</p>
                <template v-if="slotProps.status == 'active'">
                  <p class="text-vanilla-400 mt-1 font-base font-normal">Seems like you clicked the button. Well, what's done is done.</p>
                  <p class="text-vanilla-400 mt-1 font-base font-normal">Anyway, the slot used in description is scoped, this allows us to refer to the current status of the step in the slots.</p>
                </template>
              </slot>
            </z-step>
        </z-stepper>
        <z-button class="mt-2" size="small" color="secondary" @clicked="nextStep">Next Step</z-button>
    </div>`
  })

export const StepperWithDirectStatus = (): unknown =>
  Vue.extend({
    components: { ZStepper, ZStep },
    template: `<div class="container">
        <z-stepper>
            <z-step title="Step 1" description="Some description" status="completed"></z-step>
            <z-step title="Step 2" description="Some description" status="active"></z-step>
            <z-step title="Step 3" description="Some description"></z-step>
        </z-stepper>
    </div>`
  })

export const StepperWithStatusFromParent = (): unknown =>
  Vue.extend({
    components: { ZStepper, ZStep, ZButton },
    template: `<div class="container">
      <z-stepper :active="2">
          <z-step title="Step 1" description="Some description"></z-step>
          <z-step title="Step 2" description="Some description"></z-step>
          <z-step title="Step 3" description="Some description"></z-step>
      </z-stepper>
  </div>`
  })
