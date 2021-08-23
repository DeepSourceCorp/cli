import FileUpload from './FileUpload.vue'

interface ZFileUploadInterface extends Vue {
  emptyFiles: () => void,
  invalidateChanges: () => void
}

export { FileUpload, ZFileUploadInterface }
