import { Trend } from '~/store/owner/detail'
import { getLastTwoTrends, getChangeFromTrend, resolveNodes, parseArrayString } from '~/utils/array'

describe('[[ Test parseArrayString ]]', () => {
  it('Parses a valid string', () => {
    const validString = `["hello", "world", "this", "is", "array", "test"]`
    const validResult = ['hello', 'world', 'this', 'is', 'array', 'test']

    expect(parseArrayString(validString)).toMatchObject(validResult)
  })

  it('Parses a valid string with multiple types', () => {
    const validString = `["hello", "1", 1, false, "array", "test"]`
    const validResult = ['hello', '1', 1, false, 'array', 'test']

    expect(parseArrayString(validString)).toMatchObject(validResult)
  })

  it('Parses an invalid input', () => {
    const validString = `["hello", "1", 1, false, "array", "test""]`

    expect(parseArrayString(validString)).toMatchObject([])
  })

  it('Parses an empty string', () => {
    const validString = ``

    expect(parseArrayString(validString)).toMatchObject([])
  })

  it('Parses null, undefined and empty input', () => {
    expect(parseArrayString()).toMatchObject([])
    expect(parseArrayString(undefined)).toMatchObject([])
    expect(parseArrayString(null)).toMatchObject([])
  })
})

describe('[[ Test resolveNodes ]]', () => {
  it('Parses a valid connection', () => {
    const validConnection = {
      edges: [{ node: 1 }, { node: 2 }, { node: 3 }]
    }

    expect(resolveNodes(validConnection)).toMatchObject([1, 2, 3])
  })

  it('Parses a valid connection with empty data', () => {
    expect(
      resolveNodes({
        edges: [{ node: 1 }, { node: 2 }, { node: null }]
      })
    ).toMatchObject([1, 2])

    expect(
      resolveNodes({
        edges: [{}, {}, {}]
      })
    ).toMatchObject([])

    expect(
      resolveNodes({
        edges: []
      })
    ).toMatchObject([])
  })
  it('Parses a nullish input', () => {
    expect(resolveNodes()).toMatchObject([])
    expect(resolveNodes(null)).toMatchObject([])
    expect(resolveNodes(undefined)).toMatchObject([])
  })
})

describe('[[ Test getLastTwoTrends ]]', () => {
  it('Parses a valid input', () => {
    const validInput: Trend = {
      labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
      values: [1, 2, 3, 4, 5, 6]
    }

    expect(getLastTwoTrends(validInput)).toMatchObject([6, 5])
  })

  it('Parses invalid values', () => {
    expect(
      getLastTwoTrends({
        labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
        // @ts-ignore
        values: null
      })
    ).toMatchObject([0, 0])

    expect(
      getLastTwoTrends({
        labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
        // @ts-ignore
        values: ['hello', 'world']
      })
    ).toMatchObject([0, 0])

    expect(
      getLastTwoTrends({
        labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
        // @ts-ignore
        values: ['hello', 45]
      })
    ).toMatchObject([45, 0])
  })

  it('Parses nullish values', () => {
    expect(
      getLastTwoTrends({
        labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
        values: []
      })
    ).toMatchObject([0, 0])

    expect(
      getLastTwoTrends({
        labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
        // @ts-ignore
        values: ['', '']
      })
    ).toMatchObject([0, 0])

    expect(
      getLastTwoTrends({
        labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
        // @ts-ignore
        values: [null, undefined]
      })
    ).toMatchObject([0, 0])
  })
})

describe('[[ Test getChangeFromTrend ]]', () => {
  it('Parses a valid input', () => {
    const validInput: Trend = {
      labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
      values: [1, 2, 3, 4, 5, 6]
    }

    expect(getChangeFromTrend(validInput) === 20).toBeTruthy()
    expect(getChangeFromTrend(validInput, false) === 1).toBeTruthy()
  })

  it('Parses invalid values', () => {
    const invalid: Trend = {
      labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
      // @ts-ignore
      values: ['hello', 'world']
    }
    expect(getChangeFromTrend(invalid) === 0).toBeTruthy()
    expect(getChangeFromTrend(invalid, false) === 0).toBeTruthy()

    const partiallyInvalid: Trend = {
      labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
      // @ts-ignore
      values: ['hello', 45]
    }
    expect(getChangeFromTrend(partiallyInvalid) === Infinity).toBeTruthy()
    expect(getChangeFromTrend(partiallyInvalid, false) === 45).toBeTruthy()
  })

  it('Parses nullish values', () => {
    let nullishInput = {
      labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
      values: []
    }

    expect(getChangeFromTrend(nullishInput) === 0).toBeTruthy()
    expect(getChangeFromTrend(nullishInput, true) === 0).toBeTruthy()

    nullishInput = {
      labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
      // @ts-ignore
      values: ['', '']
    }

    expect(getChangeFromTrend(nullishInput) === 0).toBeTruthy()
    expect(getChangeFromTrend(nullishInput, true) === 0).toBeTruthy()

    nullishInput = {
      labels: ['romeo', 'juliet', 'not', 'the', 'smartest', 'blokes'],
      // @ts-ignore
      values: [null, undefined]
    }

    expect(getChangeFromTrend(nullishInput) === 0).toBeTruthy()
    expect(getChangeFromTrend(nullishInput, true) === 0).toBeTruthy()
  })
})
