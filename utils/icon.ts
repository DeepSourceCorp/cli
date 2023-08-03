import Icons from '~/icons/icons.json'

interface Icons {
  [key: string]: any
}

class Icon {
  name: string
  contents: string
  constructor(name: string, contents: string) {
    this.name = name
    this.contents = contents
  }
}

export default Object.keys(Icons)
  .map((key) => new Icon(key, (Icons as Record<string, any>)[key]))
  .reduce((object: Record<string, Icon>, icon) => {
    object[icon.name] = icon
    return object
  }, {})
