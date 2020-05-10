import { UserProp } from './../helpers/UserProp'
import { TelegrafContext } from 'telegraf/typings/context'

export async function handleNonetwork(ctx: TelegrafContext & UserProp) {
  ctx.dbuser.password = undefined
  await ctx.dbuser.save()
  return ctx.replyWithHTML('Нетворкинг успешно отключен!')
}
