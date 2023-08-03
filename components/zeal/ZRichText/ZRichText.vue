<template>
  <div>
    <div
      class="z-rich-text group flex w-full flex-col items-center rounded-md border outline-none"
      :class="[
        borderStyles,
        {
          'cursor-not-allowed text-slate': disabled,
          'text-vanilla-300': !disabled,
          [padding]: padding
        }
      ]"
    >
      <bubble-menu v-if="editor" :editor="editor">
        <div
          v-if="toggleLinkInput || selectionHasLink"
          class="flex rounded-md border border-ink-200 bg-ink-400 focus-within:border-ink-100"
        >
          <z-input
            ref="linkInput"
            v-model="inputLink"
            type="url"
            placeholder="Add a link"
            size="small"
            :show-border="false"
            @keydown.enter.prevent=""
            @keyup.prevent="applyLink"
          />
          <div class="border-l border-ink-100">
            <z-button
              icon="trash-2"
              icon-size="small"
              size="small"
              button-type="secondary"
              type="button"
              :disabled="!editor.isActive('link')"
              @click="editor.chain().focus().extendMarkRange('link').unsetLink().run()"
            />
          </div>
        </div>
      </bubble-menu>
      <editor-content :editor="editor" class="w-full outline-none" />
      <div
        v-if="editor"
        class="flex w-full items-center space-x-1 rounded-b-md border-t py-2"
        :class="[
          $slots['left-toolbar'] ? 'pl-2 pr-4' : 'px-4',
          borderStyles,
          isFocused ? 'bg-ink-300' : 'bg-ink-400',
          {
            'cursor-not-allowed text-slate': disabled,
            'text-vanilla-300': !disabled,
            [padding]: padding
          }
        ]"
      >
        <slot name="left-toolbar"></slot>
        <div class="flex-grow"></div>
        <slot name="right-toolbar">
          <z-icon icon="z-markdown" size="base" color="slate" />
        </slot>
      </div>
    </div>
    <div
      v-if="(editor && !!maxLength && maxLength === editor.getCharacterCount()) || invalidState"
      class="px-4 py-2"
    >
      <div
        v-if="editor && !!maxLength && maxLength === editor.getCharacterCount()"
        class="mt flex items-center space-x-1 text-xxs leading-none text-cherry"
      >
        <z-icon icon="alert-circle" color="currentColor" size="small" />
        <span> {{ maxLength }} / {{ maxLength }} characters used. </span>
      </div>
      <div
        v-else-if="invalidState"
        class="flex items-center space-x-1 text-xxs leading-none text-cherry"
      >
        <z-icon icon="alert-circle" color="currentColor" size="small" />
        <span> {{ invalidStateMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Editor as EditorCore, Extensions } from '@tiptap/core'
import { Editor, EditorContent, BubbleMenu } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'
import ZIcon from '../ZIcon'
import ZInput from '../ZInput/ZInput.vue'
import ZButton from '../ZButton/ZButton.vue'
import type { Mark } from 'prosemirror-model'

interface HeadingLevel {
  Level: (1 | 2 | 3 | 4 | 5 | 6)[]
}

export default Vue.extend({
  name: 'ZRichText',
  components: {
    EditorContent,
    ZIcon,
    BubbleMenu,
    ZInput,
    ZButton
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    padding: {
      type: String,
      default: undefined
    },
    placeholder: {
      type: String,
      default: 'Enter a value'
    },
    showBorder: {
      type: Boolean,
      default: true
    },
    maxLength: {
      type: Number,
      default: 0
    },
    minLength: {
      type: Number,
      default: 0
    },
    minLengthErrMsg: {
      type: String,
      default: ''
    },
    disabled: {
      default: false,
      type: Boolean
    },
    isInvalid: {
      type: Boolean,
      default: false
    },
    headingLevels: {
      type: Array,
      default: () => [1, 2]
    },
    validateOnBlur: {
      type: Boolean,
      default: true
    },
    customExtensions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      editor: null as Editor | null,
      invalidState: false,
      invalidStateMessage: '',
      isFocused: false,
      inputLink: '',
      toggleLinkInput: false,
      lastPos: 0
    }
  },
  computed: {
    borderStyles(): string {
      if (this.isInvalid) {
        return 'border-cherry'
      }
      if (this.showBorder) {
        return 'border-ink-200 focus-within:border-vanilla-400 group-focus-within:border-vanilla-400'
      }
      return 'border-transparent'
    },
    selectionHasLink(): boolean | undefined {
      if (this.editor) this.fetchLink(this.editor)
      return this.editor?.isActive('link') && !this.editor?.state.selection.empty
    }
  },
  mounted() {
    this.editor = new Editor({
      content: this.value,
      editable: !this.disabled,
      editorProps: {
        attributes: {
          class:
            'prose prose-rte focus:outline-none w-full max-w-full max-h-102 min-h-36 overflow-auto p-4'
        }
      },
      extensions: [
        StarterKit.configure({
          heading: {
            levels: this.headingLevels as HeadingLevel['Level']
          }
        }),
        Link.extend({
          addKeyboardShortcuts: () => {
            return {
              'Mod-k': () => {
                this.toggleLinkInput = true
                this.$nextTick(() => {
                  const inputTextbox = this.$refs.linkInput as HTMLInputElement
                  inputTextbox.focus()
                })
                return true
              }
            }
          }
        }),
        Image.configure({ allowBase64: false }),
        Placeholder.configure({
          placeholder: this.placeholder
        }),
        CharacterCount.configure({
          limit: this.maxLength
        }),
        ...(this.customExtensions as Extensions)
      ],
      onUpdate: ({ editor }): void => {
        let editorHtml = editor.getHTML()
        /**
         * ! The following if snippet is to prevent a bug with tiptap.
         * ! Can be removed once the following is resolved:
         * ? Refer: https://github.com/ueberdosis/tiptap/issues/1672
         */
        if (editor.isEmpty) {
          editor.commands.clearContent()
          editorHtml = ''
        }
        this.$emit('input', editorHtml)
      },
      onFocus: (): void => {
        this.isFocused = true
      },
      onBlur: ({ editor }): void => {
        this.validateInput(editor)
        this.isFocused = false
      },
      onSelectionUpdate: ({ editor }): void => {
        if (editor.state.selection.empty) {
          this.toggleLinkInput = false
          this.inputLink = ''
          return
        }
        const {
          state: { selection }
        } = editor
        this.lastPos = selection.anchor
      }
    })
  },
  beforeDestroy() {
    this.editor?.destroy()
  },
  watch: {
    value(value) {
      const isSame = this.editor?.getHTML() === value
      if (isSame) {
        return
      }
      this.editor?.commands.setContent(this.value, false)
    },
    disabled(value) {
      this.editor?.setOptions({ editable: !value })
    }
  },
  methods: {
    validateInput(editor: EditorCore): void {
      //? Separate validateOnBlur and minLength if there are further validations added in the future
      //! Refactor to accept an array of functions that control errored state by returning string or boolean
      if (this.validateOnBlur && this.minLength) {
        if ((editor?.getCharacterCount() || 0) < this.minLength) {
          this.invalidState = true
          this.invalidStateMessage = this.minLengthErrMsg
          this.$emit('invalid', this.invalidStateMessage)
          return
        }
        this.invalidState = false
        this.invalidStateMessage = ''
      }
    },
    applyLink(e: KeyboardEvent): void {
      if (e.code === 'Enter' && this.editor) {
        const httpStartCheck = new RegExp(/^https?:\/\//)
        const hasHttp = httpStartCheck.test(this.inputLink)
        this.editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: hasHttp ? this.inputLink : `https://${this.inputLink}` })
          .setTextSelection(this.lastPos)
          .run()
        this.toggleLinkInput = false
        this.inputLink = ''
      } else if (e.code === 'Escape' && this.editor) {
        this.editor.chain().focus().setTextSelection(this.lastPos).run()
        this.toggleLinkInput = false
        this.inputLink = ''
      }
    },
    fetchLink(editor: EditorCore): void {
      const {
        state,
        state: { selection }
      } = editor
      const { from, to } = selection
      let marks: Mark[] = []
      state.doc.nodesBetween(from, to, (node) => {
        marks = [...marks, ...node.marks]
      })
      const mark = marks.find((markItem) => markItem.type.name === 'link')
      this.inputLink = mark && mark.attrs.href ? mark.attrs.href : ''
    }
  }
})
</script>
<style lang="postcss">
/*
 TODO: migrate the following css to typography.js with support for purging.
 */
.prose-rte p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  @apply pointer-events-none float-left h-0 text-slate;
}
</style>
