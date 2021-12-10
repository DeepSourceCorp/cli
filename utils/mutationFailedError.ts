class MutationFailedError extends Error {
  constructor(...params: any) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MutationFailedError)
    }

    this.name = 'MutationFailedError'
  }
}

export default MutationFailedError
