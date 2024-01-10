import Router from 'koa-router'

const router = new Router()

router.get('/', async (ctx) => {
  ctx.body = 'this is about route'
})

router.get('/test-about', async (ctx) => {
  ctx.body = 'this is test-about route'
})

export default router
