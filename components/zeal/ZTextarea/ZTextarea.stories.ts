import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import ZTextarea from './ZTextarea.vue'
import ZButton from '@/components/ZButton/ZButton.vue'

export default {
  title: 'Textarea',
  component: ZTextarea,
  excludeStories: /.*Data$/
}

export const DefaultTextarea = () => ({
  components: { ZTextarea },
  data() {
    return {
      value: ''
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container h-36">
            <z-textarea v-model="value"></z-textarea>
        </div>
    </div>`
})

export const TextareaWithContent = () => ({
  components: { ZTextarea },
  data() {
    return {
      value:
        'ssh-rsa DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifq'
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container h-36">
            <z-textarea v-model="value"></z-textarea>
        </div>
    </div>`
})

export const DisabledTextarea = () => ({
  components: { ZTextarea },
  data() {
    return {
      value:
        'ssh-rsa DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifq'
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container h-36">
            <z-textarea v-model="value" :disabled="true"></z-textarea>
        </div>
    </div>`
})

export const TextareaWithRightSlot = () => ({
  components: { ZTextarea, ZButton },
  data() {
    return {
      value:
        'ssh-rsa DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifq'
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container h-36">
          <z-textarea v-model="value">
              <z-button color="secondary" iconSpacing="base" icon="copy" iconSize="small" iconColor="vanilla-100"></z-button>
          </z-textarea>
        </div>
    </div>`
})

export const ResizableTextarea = () => ({
  components: { ZTextarea, ZButton },
  data() {
    return {
      value:
        'ssh-rsa DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifqw78aYAFA7VYF7v6S7dvyDVA7f21DEWFYFGEWFYDvaysvsaifq'
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container h-36">
          <z-textarea v-model="value" resizable="true">
          </z-textarea>
        </div>
    </div>`
})

export const MaxLengthTextarea = () => ({
  components: { ZTextarea, ZButton },
  data() {
    return {
      value: 'There can at most only be 60 characters in this text area.'
    }
  },
  template: `<div class='padded-container'>
        <div class="input-container h-36">
          <z-textarea v-model="value" resizable="true" maxLength="60">
          </z-textarea>
          <p class="mt-2 text-vanilla-100">{{60 - value.length}}/60 characters left</p>
        </div>
    </div>`
})
