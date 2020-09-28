import { UserProp } from './../helpers/UserProp'
import { TelegrafContext } from 'telegraf/typings/context'

export async function handleNonetwork(ctx: TelegrafContext & UserProp) {
  let [, password] = ctx.message.text.split(' ')
  if (!password) {
    ctx.dbuser.passwords = []
    await ctx.dbuser.save()
    return ctx.reply('Нетворкинг во всех сообществах успешно отключен!')
  } else {
    if (ctx.dbuser.passwords.includes(password)) {
      ctx.dbuser.passwords = ctx.dbuser.passwords.filter((p) => p !== password)
      await ctx.dbuser.save()
      return ctx.reply(`Нетворкинг в сообществе ${password} успешно отключен!`)
    } else {
      return ctx.reply(
        `Вы и так не были частью сообщества ${password}. Я тут одна, а вас много. Переставайте лишний раз меня гонять. И вообще, я на обеде.`
      )
    }
  }
}
