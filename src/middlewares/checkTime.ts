import { TelegrafContext } from 'telegraf/typings/context'

export async function checkTime(ctx: TelegrafContext, next: () => any) {
  if (ctx.updateType === 'message') {
    if (new Date().getTime() / 1000 - ctx.message.date < 5 * 60) {
      next()
    } else {
      console.log(
        `Ignoring message from ${ctx.from.id} at ${ctx.chat.id} (${
          new Date().getTime() / 1000
        }:${ctx.message.date})`
      )
    }
  } else {
    next()
  }
}
