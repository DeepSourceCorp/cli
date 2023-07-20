export type AnalysisRequestBodyT = {
  snippet_ids: string[]
}

export type AutofixRequestBodyT = {
  shortcode: string
  snippet_ids: Record<string, string[]>
  run_id: string
}

export const fetchSnippets = async (
  endpointUrl: string,
  requestBody: AnalysisRequestBodyT | AutofixRequestBodyT
) => {
  const requestHeaders = new Headers()
  requestHeaders.append('Content-Type', 'application/json')

  const requestOptions: Parameters<typeof fetch>[1] = {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(requestBody),
    credentials: 'include'
  }

  const response = await fetch(endpointUrl, requestOptions)

  if (!response.ok) {
    throw new Error()
  }

  return response.json()
}
