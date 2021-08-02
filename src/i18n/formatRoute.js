const fs = require('fs')
const path = require('path')


module.exports = (localeMap, prettierCode) => {
  const absolutePath = process.cwd()
  let content
  if (fs.existsSync(path.join(absolutePath, '/config/routes.ts'))) {
    content = fs.readFileSync(path.join(absolutePath, '/config/routes.ts'), 'utf-8')
  } else if (fs.existsSync(path.join(absolutePath, '/config/routes.js'))) {
    content = fs.readFileSync(path.join(absolutePath, '/config/routes.js'), 'utf-8')
  } else return
  const formatContent = content.replace('export default', 'module.exports =')
  fs.writeFileSync('./routes.js', formatContent)
  const routes = require(path.join(absolutePath, '/routes.js'))

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
  
  const result = prettierCode(`export default ${JSON.stringify(routes)}`, path.join(absolutePath, '/config/routes.ts'))
  fs.writeFileSync(path.join(absolutePath, '/config/routes.ts'), result)
  fs.unlinkSync(path.join(absolutePath, '/routes.js'))
}

