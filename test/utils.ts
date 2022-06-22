type BooleanProps = Record<string, boolean | number | null | undefined>[]
type StringProps = Record<string, string | null | undefined>[]
type GenericProps = Record<string, unknown | null | undefined>[]
type NullProps = Record<string, null | undefined>[]

function cartesian(...arr: Record<string, unknown>[][]): Record<string, unknown>[] {
  const product = arr.reduce((currentProp, acc) => {
    return currentProp.flatMap((propItem) => {
      return acc.map((accPropItem) => {
        return Object.assign({}, accPropItem, propItem)
      })
    })
  })

  return product
}

function generateBooleanProps(key: string, withNulls = true): BooleanProps {
  return (withNulls ? (generateNulls(key) as BooleanProps) : []).concat(
    { [key]: true },
    { [key]: false }
  )
}

function generateStringProps(key: string, values: string[], withNulls = true): StringProps {
  return (withNulls ? (generateNulls(key) as StringProps) : []).concat(
    ...values.map((val) => {
      return { [key]: val }
    })
  )
}

function generateGenericProps(key: string, values: unknown[], withNulls = true): GenericProps {
  return (withNulls ? (generateNulls(key) as GenericProps) : []).concat(
    ...values.map((val) => {
      return { [key]: val }
    })
  )
}

function generateNulls(key: string): NullProps {
  return [{ [key]: null }, { [key]: undefined }]
}

export { generateBooleanProps, generateStringProps, generateGenericProps, generateNulls, cartesian }
