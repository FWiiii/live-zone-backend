import Router from 'koa-router'

const router = new Router()

router.get('/', async (ctx) => {
  ctx.body = 'this is home route'
})

router.get('/testHome', async (ctx) => {
  ctx.body = 'this is test-home route'
})

export default router
