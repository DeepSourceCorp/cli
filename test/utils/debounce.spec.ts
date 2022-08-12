import { debounce, debounceAsync } from '~/utils/debounce'

describe('[[ Test debounce ]]', () => {
  it('should debounce a function', (done) => {
    let callCount = 0

    const debounced = debounce((value: string) => {
      ++callCount
      return value
    }, 50)

    let results = [debounced('a'), debounced('b'), debounced('c')]
    expect(results).toStrictEqual([undefined, undefined, undefined])
    expect(callCount).toBe(0)

    setTimeout(() => {
      expect(callCount).toBe(1)

      // call again to ensure it gets triggered the next time
      results = [debounced('a'), debounced('b'), debounced('c')]
    }, 128)

    setTimeout(() => {
      expect(callCount).toBe(2)
      done()
    }, 500)
  })

  it('should debounce a function with default', (done) => {
    let callCount = 0

    const debounced = debounce((value: string) => {
      ++callCount
      return value
    })

    let results = [debounced('a'), debounced('b'), debounced('c')]
    expect(results).toStrictEqual([undefined, undefined, undefined])
    expect(callCount).toBe(0)

    setTimeout(() => {
      expect(callCount).toStrictEqual(1)
      done()
    }, 500)
  })
})

describe('[[ Test debounceAsync ]]', () => {
  it('should debounce an async function', (done) => {
    let callCount = 0

    const debounced = debounceAsync(async (value: string) => {
      setTimeout(() => {
        ++callCount
        return Promise.resolve(value)
      }, 30)
    }, 30)

    let results = [debounced('a'), debounced('b'), debounced('c')]
    expect(results).toMatchInlineSnapshot(`
      Array [
        Promise {},
        Promise {},
        Promise {},
      ]
    `)
    expect(callCount).toBe(0)

    setTimeout(() => {
      expect(callCount).toBe(1)

      // call again to ensure it gets triggered the next time
      results = [debounced('a'), debounced('b'), debounced('c')]
    }, 128)

    setTimeout(() => {
      expect(callCount).toBe(2)
      done()
    }, 500)
  })

  it('should debounce an async function with default timeout', (done) => {
    let callCount = 0

    const debounced = debounceAsync(async (value: string) => {
      setTimeout(() => {
        ++callCount
        return Promise.resolve(value)
      }, 30)
    })

    let results = [debounced('a'), debounced('b'), debounced('c')]
    expect(results).toMatchInlineSnapshot(`
      Array [
        Promise {},
        Promise {},
        Promise {},
      ]
    `)
    expect(callCount).toBe(0)

    setTimeout(() => {
      expect(callCount).toBe(1)
      done()
    }, 500)
  })
})
