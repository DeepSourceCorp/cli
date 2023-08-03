import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZRadioGroup from '../ZRadioGroup/ZRadioGroup.vue'
import ZRadioButton from '../ZRadioButton/ZRadioButton.vue'
import ZIcon from '../ZIcon/ZIcon.vue'
import ZRadio from './ZRadio.vue'

export default {
  title: 'Radio Button',
  component: ZRadio,
  excludeStories: /.*Data$/
}

export const DefaultRadio = () => ({
  components: { ZRadioGroup, ZRadio },
  data() {
    return {
      modelValue: ''
    }
  },
  template: `<div class='padded-container'>
            <div class="input-container">
                <z-radio-group v-model="modelValue">
                    <z-radio value="female" label="Female"></z-radio>
                    <z-radio value="male" label="Male"></z-radio>
                </z-radio-group>
            </div>
        </div>`
})

export const CheckedRadioButton = () => ({
  components: { ZRadioGroup, ZRadio },
  data() {
    return {
      modelValue: 'female'
    }
  },
  template: `<div class='padded-container'>
            <div class="input-container">
                <z-radio-group v-model="modelValue" class="flex flex-col gap-2">
                    <z-radio value="female" label="Female"></z-radio>
                    <z-radio value="male" label="Male"></z-radio>
                </z-radio-group>
            </div>
        </div>`
})

export const DisabledRadioButton = () => ({
  components: { ZRadioGroup, ZRadio },
  data() {
    return {
      modelValue: ''
    }
  },
  template: `<div class='padded-container'>
            <div class="input-container">
                <z-radio-group v-model="modelValue" :disabled="true" class="flex flex-col gap-2">
                    <z-radio value="female" label="Female"></z-radio>
                    <z-radio value="male" label="Male"></z-radio>
                </z-radio-group>
            </div>
        </div>`
})

export const ReadOnlyRadioButton = () => ({
  components: { ZRadioGroup, ZRadio },
  data() {
    return {
      modelValue: 'female'
    }
  },
  template: `<div class='padded-container'>
            <div class="input-container">
                <z-radio-group v-model="modelValue" :readOnly="true" class="flex flex-col gap-2">
                    <z-radio value="female" label="Female"></z-radio>
                    <z-radio value="male" label="Male"></z-radio>
                </z-radio-group>
            </div>
        </div>`
})

export const DisabledCheckedRadioButton = () => ({
  components: { ZRadioGroup, ZRadio },
  data() {
    return {
      modelValue: 'female'
    }
  },
  template: `<div class='padded-container'>
            <div class="input-container">
                <z-radio-group v-model="modelValue" :disabled="true" class="flex space-x-4">
                    <z-radio value="female" label="Female"></z-radio>
                    <z-radio value="male" label="Male"></z-radio>
                </z-radio-group>
            </div>
        </div>`
})

export const DefaultRadioButtonStyle = () => ({
  components: { ZRadioGroup, ZRadio, ZRadioButton },
  data() {
    return {
      modelValue: 'female'
    }
  },
  template: `<div class='padded-container'>
            <div class="input-container">
                <z-radio-group v-model="modelValue" class="flex">
                    <z-radio-button value="female" label="Female"></z-radio-button>
                    <z-radio-button value="male" label="Male"></z-radio-button>
                </z-radio-group>
            </div>
        </div>`
})

export const RadioButtonStyleWithCustomContent = () => ({
  components: { ZRadioGroup, ZRadio, ZRadioButton, ZIcon },
  data() {
    return {
      modelValue: 'python'
    }
  },
  template: `<div class='padded-container'>
            <div class="input-container">
                <z-radio-group v-model="modelValue" class="flex">
                    <z-radio-button value="python">
                      <div class="flex items-center space-x-1">
                        <z-icon icon="star" size="small"></z-icon>
                        <span>Python</span>
                      </div>
                    </z-radio-button>
                    <z-radio-button value="go">
                      <div class="flex items-center space-x-1">
                        <z-icon icon="star" size="small"></z-icon>
                        <span>Go</span>
                      </div>
                    </z-radio-button>
                    <z-radio-button value="js">
                      <div class="flex items-center space-x-1">
                        <z-icon icon="star" size="small"></z-icon>
                        <span>JavaScript</span>
                      </div>
                    </z-radio-button>
                </z-radio-group>
            </div>
        </div>`
})
