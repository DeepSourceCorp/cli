<template>
  <div class="p-4 rounded-md bg-ink-300 border border-ink-200 space-y-4">
    <div class="flex items-center w-full justify-between">
      <div class="flex items-center gap-x-4 h-13">
        <!-- account avatar -->
        <z-avatar
          :image="newAvatar.url ? newAvatar.url : viewer.avatar"
          :fallback-image="getDefaultAvatar(viewer.email)"
          :user-name="viewer.fullName || viewer.firstName"
          size="lg"
          stroke="bg-ink-100 p-px"
          class="flex-shrink-0"
        />

        <!-- account display name and email -->
        <div v-if="editMode" class="flex flex-col gap-y-2">
          <div class="text-vanilla-400 text-xs">The image should be less than 2MB (200x200).</div>
          <div>
            <button @click="onFileUploadClick" class="auxillary-button">
              <div
                class="flex flex-shrink items-center text-xs gap-x-2 text-vanilla-400 hover:text-vanilla-100"
              >
                <z-icon icon="upload" color="vanilla-400" />
                <span> Upload new avatar </span>
              </div>
            </button>
          </div>
          <input
            ref="fileInput"
            :disabled="isSaving"
            type="file"
            accept="image/jpeg, image/png, image/svg+xml"
            class="hidden"
            @change="filesChange($event.target.files)"
          />
        </div>
        <div v-else class="flex flex-col gap-y-1.5">
          <span class="leading-6">{{ viewer.fullName || viewer.firstName || viewer.email }}</span>
          <span v-if="viewer.fullName || viewer.firstName" class="text-vanilla-400 text-sm">{{
            viewer.email
          }}</span>
        </div>
      </div>

      <div v-if="!editMode" class="self-start">
        <button class="auxillary-button" @click="toggleEditMode">
          <div class="flex items-center text-xs gap-x-2 text-vanilla-400 hover:text-vanilla-100">
            <z-icon icon="edit-2" color="vanilla-400" size="x-small" />
            <span> Edit </span>
          </div>
        </button>
      </div>
    </div>
    <div v-if="editMode" class="grid grid-cols-2 gap-4 text-vanilla-100">
      <label>
        <div class="text-xs mb-1.5">Display name</div>
        <z-input v-model="displayName" label="Display name" size="small" />
      </label>
      <label>
        <div class="text-xs mb-1.5">Email</div>
        <div
          class="h-8 flex items-center w-full py-1 px-2 space-x-2 text-xs space-x-1 leading-loose text-vanilla-400 bg-ink-300 border border-ink-200 rounded-sm"
        >
          <span class="flex-grow">{{ viewer.email }}</span>
          <z-icon icon="z-lock" size="x-small" />
        </div>
      </label>
      <div class="flex gap-x-3 justify-end col-span-2">
        <button class="auxillary-button" @click="toggleEditMode">
          <div
            class="flex flex-shrink items-center text-xs gap-x-1 text-vanilla-400 hover:text-vanilla-100"
          >
            <z-icon icon="corner-up-left" color="vanilla-400" />
            <span>Discard</span>
          </div>
        </button>
        <z-button
          :is-loading="isSaving"
          icon="check"
          size="x-small"
          class="h-7 px-1"
          @click="saveDetails"
          >Save changes</z-button
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin from '~/mixins/authMixin'
import { getDefaultAvatar } from '~/utils/ui'
import { ZAvatar, ZIcon, ZInput, ZButton } from '@deepsource/zeal'
import { FileUploadContexts, FileUploadTokenT, uploadFiles } from '~/utils/files'

@Component({
  components: {
    ZAvatar,
    ZIcon,
    ZInput,
    ZButton
  },
  methods: { getDefaultAvatar }
})
export default class UserProfile extends mixins(ActiveUserMixin, AuthMixin) {
  public editMode = false
  public displayName = ''
  public isSaving = false
  public newAvatar = {
    filename: '',
    token: '',
    url: ''
  } as FileUploadTokenT

  /**
   * Fetch hook
   * Perform a network-only fetch of the viewer GQL query
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchActiveUser({ refetch: true })
  }

  /**
   * Toggles the component between 'edit' and 'view' modes
   *
   * @returns {void}
   */
  toggleEditMode() {
    this.editMode = !this.editMode
    if (this.editMode) {
      this.displayName = this.viewer.fullName || this.viewer.firstName
    } else this.reset()
  }

  /**
   * Handles the file upload button click event
   *
   * @returns {void}
   */
  onFileUploadClick() {
    const fileInput = this.$refs.fileInput as HTMLInputElement
    if (fileInput) fileInput.click()
  }

  /**
   * Handles the change event of the file input element. Triggers a file upload if files have been selected
   *
   * @param {Array<File>} fileList
   */
  filesChange(fileList: Array<File>) {
    if (!fileList.length) return
    this.uploadAvatar(fileList[0])
  }

  /**
   * Validates the inputs for email and display name
   *
   * @returns {boolean | void}
   */
  validateInputs() {
    if (!this.displayName) {
      throw new Error('Display name is required')
    }
    if (this.displayName.length < 3) {
      throw new Error('Display name must be 3 characters or longer')
    }
    return true
  }

  /**
   * Resets the component state in case changes are discarded
   *
   * @returns {void}
   */
  reset() {
    this.editMode = false
    this.displayName = ''
    this.newAvatar = {
      filename: '',
      token: '',
      url: ''
    } as FileUploadTokenT
  }

  /**
   * Handles the upload of the selected display picture, and updates `newAvatar` with the URL recieved from the API call
   *
   * @param {File} file
   */
  async uploadAvatar(file: File) {
    try {
      const fileUploadTokens = await uploadFiles(
        this.$config.restClientUri,
        FileUploadContexts.avatars,
        [file],
        {
          headers: {
            Authorization: `JWT ${this.token}`
          }
        }
      )
      this.newAvatar = fileUploadTokens[0]
    } catch (err) {
      this.$toast.show({
        type: 'danger',
        message:
          'An Error occurred while uploading the new Avatar. Please try again or contact support.',
        timeout: 5
      })

      this.$logErrorAndToast(err as Error)
    }
  }

  /**
   * Saves the updated user profile details (display name, email, avatar).
   * Refreshes the JWT since the existing one has the old email
   * Re-fetches the viewer
   *
   * @returns {void}
   */
  async saveDetails() {
    try {
      this.isSaving = true

      if (this.validateInputs()) {
        const updatedViewer = await this.updateUserDetails({
          displayName: this.displayName,
          avatarToken: this.newAvatar.token || undefined
        })
        if (updatedViewer) {
          await this.fetchActiveUser({ refetch: true })
          this.reset()
          this.$toast.success('User details updated.')
        }
      }
    } catch (err) {
      const error = err as Error
      const errorMessage = `${error.message}.` as `${string}.`
      this.$logErrorAndToast(error, errorMessage)
    } finally {
      this.isSaving = false
    }
  }
}
</script>
