import { TelegrafContext } from 'telegraf/typings/context'

export function checkSuperAdmin(ctx: TelegrafContext, next) {
  if (ctx.from.id !== parseInt(process.env.ADMIN, 10)) {
    return
  }
  return next()
}
