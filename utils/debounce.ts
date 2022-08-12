// skipcq: JS-0323
/**
 * Debounce a regular function
 *
 * This function returns a wrapped function that triggers the
 * callback after the given `wait` time
 *
 * @param {T} callback
 * @param {number} wait=350
 *
 * @return
 */
export function debounce<T extends (...args: any) => any>(callback: T, wait = 350) {
  let timer: ReturnType<typeof setTimeout>

  // skipcq: JS-0323
  const callable = (...args: any) => {
    clearTimeout(timer)
    timer = setTimeout(() => callback(...args), wait)
  }

  // skipcq: JS-0323
  return <T>(<any>callable)
}

// skipcq: JS-0323
/**
 * Debounce a async function that returns a promise
 *
 * This function returns a wrapped function that returns Promise
 * The promise from the wrapped function triggers that callback after the wait time
 * and resolves the promise once the callback is resolved.
 *
 * ! note: This will only resolve the last promise
 *
 * @param {T} callback - callback method to be called
 * @param {number} wait - milliseconds to wait before calling the function
 *
 * @returns Promise
 *
 * @example
 * debouncedSearch = debounceAsync(this.search, 200)
 *
 * // this will wait 200ms and resolve once `this.search` is resolved
 * await debounceSearch('hello-world')
 */
export function debounceAsync<T extends (...args: any[]) => any>(callback: T, wait = 350) {
  let timer: ReturnType<typeof setTimeout>

  // TypeScript 4.5 has Awaited type, remove this after upgrade
  type AwaitedT<T> = T extends PromiseLike<infer U> ? U : T
  type CallableType = AwaitedT<ReturnType<T>>

  // skipcq: JS-D1001
  const callable = (...args: Parameters<T>): Promise<CallableType> => {
    clearTimeout(timer)
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(callback(...args)), wait)
    })
  }
  return callable
}
