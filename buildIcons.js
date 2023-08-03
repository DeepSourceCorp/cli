const path = require('path')
const fs = require('fs')
const cheerio = require('cheerio')
const minify = require('html-minifier')

const IN_DIR = path.resolve(__dirname, './icons')
const OUT_FILE = path.resolve(__dirname, './icons/icons.json')

const getSvgContents = (svg) => {
  const loadedSvg = cheerio.load(svg)
  return minify.minify(loadedSvg('svg').html(), { collapseWhitespace: true })
}

const buildIconsObject = (files, getSvg) => {
  return files
    .map((file) => {
      const name = path.basename(file, '.svg')
      const svg = getSvg(file)
      const contents = getSvgContents(svg)
      return { name, contents }
    })
    .reduce((icons, icon) => {
      icons[icon.name] = icon.contents
      return icons
    }, {})
}

console.log(`Getting icons from ${IN_DIR}`)
console.log(`Building ${OUT_FILE}...`)

const svgFiles = fs.readdirSync(IN_DIR).filter((file) => path.extname(file) === '.svg')

const getSvg = (svgFile) => fs.readFileSync(path.join(IN_DIR, svgFile))

const icons = buildIconsObject(svgFiles, getSvg)

fs.writeFileSync(OUT_FILE, JSON.stringify(icons))
