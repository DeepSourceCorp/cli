import '@testing-library/jest-dom'
import { render, fireEvent } from '@testing-library/vue'
import dayjs from 'dayjs'
import VTooltip from 'floating-vue'
import TokenCard from '~/components/AccessToken/TokenCard.vue'
import { BaseCard } from '~/components/History'
import ZButton from '~/components/zeal/ZButton'
import { cartesian, generateStringProps } from '~/test/utils'
import { AccessTokenExpirationStatus } from '~/types/types'

test('renders TokenCard with all props', () => {
  Date.now = jest.fn(() => new Date(Date.UTC(2055, 1, 14)).valueOf())

  const statusOpts = generateStringProps(
    'expirationStatus',
    [
      AccessTokenExpirationStatus.Active,
      AccessTokenExpirationStatus.DoesNotExpire,
      AccessTokenExpirationStatus.Expired
    ],
    false
  )

  cartesian(statusOpts).forEach((propCombination) => {
    const { html } = render(
      TokenCard,
      {
        props: {
          ...propCombination,
          expiresAt: '2055-02-07T10:13:12.689Z',
          id: '4235234534',
          lastUsedAt: '2054-02-07T10:13:12.689Z',
          description: 'mock-description'
        },
        stubs: {
          ZIcon: true,
          ZButton: true,
          BaseCard: BaseCard
        }
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )
    expect(html()).toMatchSnapshot()
  })
})

test('Emits delete event', async () => {
  const id = '4235234534'
  const { getByRole, emitted } = render(
    TokenCard,
    {
      props: {
        lastUsedAt: dayjs().toISOString(),
        expiresAt: dayjs().toISOString(),
        expirationStatus: AccessTokenExpirationStatus.Active,
        id,
        description: 'mock-description'
      },
      components: { ZButton },
      stubs: {
        ZIcon: true,
        BaseCard
      }
    },
    (vue) => {
      vue.use(VTooltip)
    }
  )

  const button = getByRole('button')

  await fireEvent(button, new Event('click'))
  expect(emitted()).toHaveProperty('delete')
  expect(emitted()['delete'][0][0]).toBe(id)
})
