import * as React from 'react'
import { mount } from 'enzyme'
import CardContainer from '../../../lib/containers/CardContainer'
import GenericCard, { GenericCardProps, GenericCardSchema } from '../../../lib/containers/GenericCard'
import * as Utils from '../../../lib/containers/row_renderers/utils'
import { InternalLinkConfiguration } from 'src/lib/containers/CardContainerLogic'

const createShallowComponent = (props: GenericCardProps) => {
  const wrapper = mount(
    <GenericCard
      {...props}
    />
  )
  const instance = wrapper.instance() as CardContainer
  return { wrapper, instance }
}

describe('it renders the UI correctly', () => {

  const iconOptions = {
    'AMP-AD': 'MOCKED_IMG_SVG_STRING',
  }

  const commonProps = {
    type: 'PROGRAM',
    title: 'title',
    subTitle: 'subtitle',
    description: 'description',
    icon: 'icon',
    link: 'link',
  }
  const genericCardSchema: GenericCardSchema = {
    ...commonProps,
    secondaryLabels: {
      0: { key: 'labelOne', alias: 'Label One' },
      1: { key: 'labelTwo' },
    }
  }
  const genericCardSchemaHeader: GenericCardSchema = {
    ...commonProps
  }
  const schema = {
    title: 0,
    subTitle: 1,
    description: 2,
    icon: 3,
    labelOne: 4,
    labelTwo: 5,
    link: 6
  }

  const MOCKED_TITLE = 'MOCKED TITLE'
  const MOCKED_SUBTITLE = 'MOCKED SUBTITLE'
  const MOCKED_DESCRIPTION = 'MOCKED DESCRIPTION'
  const MOCKED_ICON = 'AMP-AD'
  const MOCKED_LABELONE = 'MOCKED_LABELONE'
  const MOCKED_LABELTWO = 'MOCKED_LABELONE'
  const MOCKED_LINK = 'MOCKED_LINK'

  const data = [
    MOCKED_TITLE,
    MOCKED_SUBTITLE,
    MOCKED_DESCRIPTION,
    MOCKED_ICON,
    MOCKED_LABELONE,
    MOCKED_LABELTWO,
    MOCKED_LINK
  ]

  const propsForNonHeaderMode: GenericCardProps = {
    data,
    genericCardSchema,
    schema,
    secondaryLabelLimit: 3
  }

  const propsForHeaderMode: GenericCardProps = {
    data,
    iconOptions,
    schema,
    genericCardSchema: genericCardSchemaHeader,
    backgroundColor: 'purple',
    isHeader: true
  }

  it('renders without crashing in non header mode', () => {
    const { wrapper } = createShallowComponent(propsForNonHeaderMode)
    expect(wrapper).toBeDefined()
  })

  it('renders the correct UI in non header mode', () => {
    const { wrapper } = createShallowComponent(propsForNonHeaderMode)
    expect(wrapper.find('img')).toBeDefined()
    expect(wrapper.find('div.SRC-type').text()).toEqual(commonProps.type)
    expect(wrapper.find('a.SRC-primary-text-color').text()).toEqual(data[0])
    expect(wrapper.find(Utils.ShowMore).props().summary).toEqual(MOCKED_DESCRIPTION)
    expect(wrapper.find(Utils.CardFooter)).toBeDefined()
  })

  it('renders as a Header without crashing', () => {
    const { wrapper } = createShallowComponent(propsForHeaderMode)
    expect(wrapper).toBeDefined()
    expect(wrapper.find('img').prop('src')).toEqual(iconOptions['AMP-AD'])
    expect(wrapper.find('div.SRC-type').text()).toEqual(commonProps.type)
    expect(wrapper.find('h3').text()).toEqual(data[0])
    expect(wrapper.find(Utils.ShowMore)).toHaveLength(0)
    expect(wrapper.find('.SRC-font-size-base').text()).toEqual(data[2])
    expect(wrapper.find(Utils.CardFooter)).toHaveLength(1)
  })

})

describe('it grabs the correct URL' , () => {
  const getLink = GenericCard.prototype.getLink
  const SELF = '_self'
  const BLANK = '_blank'

  it('creates a link to synapse', () => {
    const synId = 'syn12345678'
    const synLink = `https://www.synapse.org/#!Synapse:${synId}`
    const { linkDisplay, target } = getLink(synId)
    expect(linkDisplay).toEqual(synLink)
    expect(target).toEqual(SELF)
  })

  it('creates a DOI link ', () => {
    const doi = '10.1093/neuonc/noy046'
    const doiLink = `https://dx.doi.org/${doi}`
    const { linkDisplay, target } = getLink(doi)
    expect(linkDisplay).toEqual(doiLink)
    expect(target).toEqual(BLANK)
  })

  it('creates an internal parameterized link', () => {
    const grantNumberValue = '1234'
    const funderValue = 'funder'
    const data = [
      grantNumberValue,
      funderValue
    ]
    const columnValues = ['Grant Number', 'Funder']
    const schema = {
      [columnValues[0]]: 0,
      [columnValues[1]]: 1
    }
    const internalLinkConfiguration: InternalLinkConfiguration = {
      baseURL: 'Explore/Projects',
      columnValues: [
        columnValues[0],
        columnValues[1]
      ]
    }
    const expectedLink = `#/Explore/Projects?Grant Number=${grantNumberValue}&Funder=${funderValue}`
    const { linkDisplay, target } = getLink('', internalLinkConfiguration, data, schema)
    expect(linkDisplay).toEqual(expectedLink)
    expect(target).toEqual(SELF)
  })
})