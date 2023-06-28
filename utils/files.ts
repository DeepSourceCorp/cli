enum FileUploadContexts {
  'zendesk' = 'zendesk',
  'logos' = 'logos',
  'avatars' = 'avatars',
  'default' = 'default'
}

interface FileUploadTokenT {
  filename: string
  token: string
  url: string
}

interface FileUploadSuccessResponseT {
  ok: true
  upload_tokens: FileUploadTokenT[]
}

type FileUploadResponse = FileUploadSuccessResponseT | FileUploadErrorResponseT

interface FileUploadErrorResponseT {
  ok: false
  error: string
}

/**
 *  An error that occurs when uploading files via {@link uploadFiles} function.
 */
class FileUploadError extends Error {
  /**
   * Creates an instance of {@link FileUploadError}
   * @param message Error message
   */
  constructor(message: string) {
    super(message)
    this.name = 'FileUploadError'
  }
}

/**
 * Function that uploads array of files to the given endpoint and returns the tokens of files uploaded.
 *
 * @param {string} uploadEndpoint URL to upload the given files to.
 * @param {FileUploadContexts} context Context of the files that are being uploaded, see {@link FileUploadContexts} for refernce.
 * @param {File[]} filesToUpload Array of {@link File} objects to upload.
 * @param {{ headers?: RequestInit['headers'] }} options Array of {@link File} objects to upload.
 *
 * @returns {Promise<FileUploadTokenT[]>} A promise that resolves into an array of {@link FileUploadTokenT} obtained from uploading the files.
 */
async function uploadFiles(
  uploadEndpoint: string,
  context: FileUploadContexts,
  filesToUpload: File[],
  options?: { headers?: RequestInit['headers'] }
): Promise<FileUploadTokenT[]> {
  const formData = new FormData()
  formData.append('upload_ctx', context)
  filesToUpload.forEach((file) => formData.append('file_list', file, file.name))

  const requestOptions = {
    method: 'POST',
    body: formData,
    headers: options?.headers ?? {},
    redirect: 'follow' as RequestInit['redirect']
  }

  const uploadResponse: Response = await fetch(uploadEndpoint, requestOptions)

  if (uploadResponse.status === 200 && uploadResponse.ok) {
    const responeObject: FileUploadResponse = await uploadResponse.json()
    if (responeObject.ok) {
      return responeObject.upload_tokens
    }
  }

  if (uploadResponse.status === 401) {
    throw new FileUploadError(
      'An error occurred while uploading attachments for your support request. Please refresh the page and try submitting the form again. If the issue persists, please email us at support@deepsource.io.'
    )
  }

  if (uploadResponse.status === 400) {
    throw new FileUploadError(
      'An error occurred while uploading attachments for your support request. Please upload your attachments again and submit the form. If the issue persists, please email us at support@deepsource.io.'
    )
  }

  if (uploadResponse.status === 415) {
    throw new FileUploadError(
      'An error occurred while uploading attachments for your support request. Please upload only image, text, and video files. If the issue persists, email us at support@deepsource.io.'
    )
  }

  if (uploadResponse.status === 413) {
    throw new FileUploadError(
      'An error occurred while uploading attachments for your support request. Please attach files with a total size of less than 10 MB. If the issue persists, email us at support@deepsource.io.'
    )
  }

  throw new FileUploadError(
    'An error occurred while uploading attachments for your support request. Please refresh the page and try submitting the form again. If the issue persists, please email us at support@deepsource.io.'
  )
}

/**
 * Validates file sizes for files
 *
 * @param {File[]} arrayOfFiles - Files whose sizes need to be validated.
 *
 * @returns boolean
 */
function validateFileSize(arrayOfFiles: File[], sizeInBytes: number): boolean {
  /**
   * Function to add a given file's size to the given total number.
   *
   * @param {number} accumulator - Total size of files till now
   * @param {File} currentFile - File whose size has to be added to the total
   *
   * @returns {number} new total size of files
   */
  const sizeConcatenator = (accumulator: number, currentFile: File): number =>
    accumulator + currentFile.size

  const totalFileSize = arrayOfFiles.reduce(sizeConcatenator, 0)

  return totalFileSize <= sizeInBytes
}

/**
 * Validates names for files
 *
 * @param {File[]} arrOfFiles - Files whose name has to validated
 *
 * @returns {boolean}
 */
function validateFileNames(arrOfFiles: File[]): boolean {
  const validFilenameRegex = /^[^:/\\<>"|?*^]{1,255}$/
  const filenameChecker = (val: File) => validFilenameRegex.test(val.name) && val.name.length <= 255

  return arrOfFiles.every(filenameChecker)
}

export {
  uploadFiles,
  FileUploadContexts,
  FileUploadTokenT,
  FileUploadSuccessResponseT,
  FileUploadError,
  validateFileNames,
  validateFileSize
}
