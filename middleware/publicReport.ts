import { Middleware } from '@nuxt/types'
import gql from 'graphql-tag'

import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { PublicReportErrors } from '~/types/reportTypes'

const publicReportMiddleware: Middleware = async ({
  $fetchGraphqlData,
  params,
  redirect,
  route,
  error
}) => {
  const { reportId } = params
  let validReports: string[] = []

  try {
    const response = (await $fetchGraphqlData(
      gql`
        query ($reportId: String!) {
          publicReport(reportId: $reportId) {
            reportKeys
          }
        }
      `,
      { reportId },
      true,
      false
    )) as GraphqlQueryResponse

    validReports = (response.data.publicReport?.reportKeys as string[]) ?? []
  } catch (e) {
    e as Error

    const message = (e as Error).message.replace('GraphQL error: ', '')

    // show 500 error if the server returns a non standard error
    if (!(Object.values(PublicReportErrors) as string[]).includes(message)) {
      error({ statusCode: 500 })
    }

    if (message === PublicReportErrors.DOES_NOT_EXIST) {
      error({ statusCode: 404, message: 'This page is not real' })
    }
  }

  if (validReports.length === 0) {
    error({ statusCode: 404, message: 'This page is not real' })
  }

  const firstReport = validReports[0]

  if (route.name === 'report-reportId') {
    redirect(['', 'report', reportId, firstReport].join('/'))
  }
}

export default publicReportMiddleware
