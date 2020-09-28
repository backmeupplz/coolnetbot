import { frequency } from './../helpers/frequency'
import { UserModel } from './../models/User'
import { UserProp } from './../helpers/UserProp'
import { TelegrafContext } from 'telegraf/typings/context'

export async function handleNetwork(ctx: TelegrafContext & UserProp) {
  let [, password] = ctx.message.text.split(' ')

  if (!password) {
    return ctx.replyWithHTML(
      'Пожалуйста, пришлите сообщение в формате <code>/network пароль_коммьюнити</code>.',
      {
        disable_web_page_preview: true,
      }
    )
  }
  if (ctx.dbuser.passwords.includes(password)) {
    const networkUrl = `t.me/${ctx.botInfo.username}?start=${password}`
    const number = await UserModel.countDocuments({
      passwords: password,
    })
    return ctx.replyWithHTML(
      `Вы подписаны на сообщество с паролем <code>${password}</code>. На данный момент, количество людей в сообществе: ${number}. Ссылка для приглашения: ${networkUrl}. Каждые ${frequency} дня бот будет присылать вам новый контакт. Спасибо!`,
      {
        disable_web_page_preview: true,
      }
    )
  }
  const networkUrl = `t.me/${ctx.botInfo.username}?start=${password}`
  const number = await UserModel.countDocuments({ passwords: password })
  ctx.dbuser.passwords.push(password)
  ctx.dbuser.notRespondedTimes = 0

  await ctx.dbuser.save()

  return ctx.replyWithHTML(
    `Успех! Вы успешно подписались на сообщество с паролем <code>${password}</code>. На данный момент, количество людей в сообществе: ${
      number + 1
    }. Ссылка для приглашения: ${networkUrl}. Каждые ${frequency} дня бот будет присылать вам новый контакт. Спасибо!`,
    {
      disable_web_page_preview: true,
    }
  )
}
