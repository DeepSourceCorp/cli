import { fireEvent, render } from '@testing-library/vue'
import { IssuePriorityCard } from '~/components/IssuePriority'
import { BaseCard } from '~/components/History'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'
import VTooltip from 'floating-vue'

test('renders IssuePriorityCard with all prop options', () => {
  const baseProps = {
    title: 'Assert statement used outside of tests',
    shortcode: 'BAN-B101',
    issueType: 'security',
    analyzer: {
      name: 'Python',
      logo: 'analyzer_logos/python.svg',
      shortcode: 'python'
    }
  }

  const priorityOptions = generateStringProps('priority', ['High', 'Medium', 'Low', 'noop'], false)
  const canChangePriorityOptions = generateBooleanProps('canChangePriority', false)

  cartesian(priorityOptions, canChangePriorityOptions).forEach((propCombination) => {
    const props = {
      ...baseProps,
      ...propCombination
    }

    const { html } = render(
      IssuePriorityCard,
      {
        props,
        stubs: {
          ZIcon: true,
          ZButton: true,
          ZMenuSection: true,
          ZMenuItem: true,
          AnalyzerLogo: true,
          BaseCard
        }
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})

test('Emits delete event', async () => {
  const shortcode = 'BAN-B101'
  const { getByTestId, emitted } = render(
    IssuePriorityCard,
    {
      props: {
        title: 'Assert statement used outside of tests',
        shortcode: 'BAN-B101',
        issueType: 'security',
        analyzer: {
          name: 'Python',
          logo: 'analyzer_logos/python.svg',
          shortcode: 'python'
        },
        priority: 'High',
        canChangePriority: true
      },
      stubs: {
        ZIcon: true,
        ZMenuSection: true,
        ZMenuItem: true,
        AnalyzerLogo: true,
        BaseCard
      }
    },
    (vue) => {
      vue.use(VTooltip)
    }
  )

  const button = getByTestId('unset-issue-priority')

  await fireEvent(button, new Event('click'))
  expect(emitted()).toHaveProperty('priority-unset')
  expect(emitted()['priority-unset'][0][0]).toBe(shortcode)
})
