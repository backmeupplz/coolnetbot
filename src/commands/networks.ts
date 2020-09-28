import { UserProp } from './../helpers/UserProp'
import { TelegrafContext } from 'telegraf/typings/context'

export async function handleNetworks(ctx: TelegrafContext & UserProp) {
  return ctx.replyWithHTML(
    ctx.dbuser.passwords.length
      ? `Вы подписаны на сообщества: ${ctx.dbuser.passwords
          .map(
            (p) => `<a href="t.me/${ctx.botInfo.username}?start=${p}">${p}</a>`
          )
          .join(', ')}`
      : 'Вы еще не подписаны на сообщества'
  )
}
