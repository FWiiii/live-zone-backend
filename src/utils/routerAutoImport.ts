import { join } from 'node:path'
import Router from 'koa-router'

const router = new Router()
export function routerAutoImport(routers: any[], path: string) {
  routers
    .filter((file: string) => file.endsWith('.ts'))
    .forEach(async (file: string) => {
      const file_name = file.substring(0, file.length - 3)
      const file_entity = await import(join('file:///', path, file))
      const f = file_entity.default
      file_name !== 'index' && router.use(`/${file_name}`, f.routes(), f.allowedMethods())
    })
  return router
}
