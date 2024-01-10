function routerResponse(option: {
  type?: string
  successCode?: number
  failCode?: number
  successMsg?: string
}) {
  return async function (ctx: any, next: () => Promise<any>) {
    ctx.success = function (data: any, msg: string) {
      ctx.type = option.type || 'json'
      ctx.body = {
        code: option.successCode || 0,
        msg: msg || option.successMsg || 'success',
        data,
      }
    }

    ctx.fail = function (msg: string, code: number) {
      ctx.type = option.type || 'json'
      ctx.body = {
        code: code || option.failCode || 99,
        msg: msg || option.successMsg || 'fail',
      }
    }

    await next()
  }
}
export default routerResponse
