import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { PORT } from '../constans'
import router from './router/index'

const app = new Koa()

app.use(bodyParser())

app.use(router.routes()).use(router.allowedMethods())

app.listen(PORT)
