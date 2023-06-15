import { AnalysisRequestBodyT, fetchSnippets } from '~/utils/runner'

describe('[[ runner utils ]]', () => {
  afterAll(() => {
    ;(global.fetch as jest.Mock).mockClear()

    // @ts-expect-error cleanup
    delete global.fetch
  })

  const endpointUrl = 'test-endpoint-url'
  const requestBody: AnalysisRequestBodyT = { snippet_ids: ['test-id-1', 'test-id-2'] }

  it('`fetchSnippets` method returns the response in JSON format if successful', async () => {
    const result = { 'test-id-1': 'test-snippet-1', 'test-id-2': 'test-snippet-2' }

    // `fetch` has not been polyfilled in the Jest JSDOM environment
    // Ref: https://github.com/jsdom/jsdom/issues/1724
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: result
          })
      })
    })

    const response = await fetchSnippets(endpointUrl, requestBody)
    expect(response.data).toEqual(result)
  })

  it('`fetchSnippets` method throws an error if the response is not successful', async () => {
    // `fetch` has not been polyfilled in the Jest JSDOM environment
    // Ref: https://github.com/jsdom/jsdom/issues/1724
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: false
      })
    })

    await expect(fetchSnippets(endpointUrl, requestBody)).rejects.toThrowError(new Error())
  })
})
