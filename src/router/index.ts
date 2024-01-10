import fs from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { routerAutoImport } from 'src/utils/routerAutoImport'

const __dirname = dirname(fileURLToPath(import.meta.url))
const routers = fs.readdirSync(__dirname)

const router = routerAutoImport(routers, __dirname)

export default router
