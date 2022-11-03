type AttachmentObj = { base64Data: string; filename: string; sizeInBytes?: number }

function fileToBase64(file: File): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (reader.result) {
        let encodedFile = reader.result.toString().replace(/^data:(.*,)?/, '')
        if (encodedFile.length % 4 > 0) {
          encodedFile += '='.repeat(4 - (encodedFile.length % 4))
        }
        resolve(encodedFile)
      }
      resolve(null)
    }
    reader.onerror = (error) => reject(error)
  })
}

async function getBase64Files(files: File[]): Promise<AttachmentObj[]> {
  const base64Files = [] as AttachmentObj[]
  for (const file of files) {
    const base64File = await fileToBase64(file).catch((err) => {
      return Error(err)
    })
    if (base64File instanceof Error) {
      throw base64File
    }
    if (base64File) base64Files.push({ base64Data: base64File?.toString(), filename: file.name })
  }
  return base64Files
}

export { AttachmentObj, getBase64Files, fileToBase64 }
