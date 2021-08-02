const fs = require('fs')
const path = require('path')
const { getFile } = require('./utils')

module.exports = (localeMap, prettierCode) => {
  const base = `${process.cwd()}/config/`
  const file = getFile({
    type: 'javascript',
    fileNameWithoutExt: 'routes',
    base
  })
  if (!file) return
  const content = fs.readFileSync(file.absolutePath, 'utf-8')
  const formatContent = content.replace('export default', 'module.exports =')
  fs.writeFileSync('./routes.js', formatContent)
  const routes = require(path.join(process.cwd(), '/routes.js'))

  const loopFn = (routes, parentName) => {
    routes.forEach(route => {
      let key = parentName
      if (route.name) {
        key = `${parentName}.${route.name}`
        route.name = localeMap[key]
      }
      if (route.routes) {
        loopFn(route.routes, key)
      }
    })
  }
  loopFn(routes, 'menu')
  const result = prettierCode(`export default ${JSON.stringify(routes)}`, file.absolutePath)
  fs.writeFileSync(file.absolutePath, result)
  fs.unlinkSync(path.join(process.cwd(), '/routes.js'))
}

