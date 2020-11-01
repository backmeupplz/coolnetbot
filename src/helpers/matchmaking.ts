import { frequency } from './frequency'
import { UserModel, User } from '../models/User'
import { DocumentType } from '@typegoose/typegoose'
import { bot } from './bot'
import { Context, Markup, Extra } from 'telegraf'

const CronJob = require('cron').CronJob

export async function matchmake() {
  // Get and filter users
  const users = (await UserModel.find({ passwords: { $exists: true } })).filter(
    (u) => !!u.passwords.length
  )
  // Get passwords to list of users
  const passwordsToUsers = {} as { [index: string]: DocumentType<User>[] }
  users.forEach((u) => {
    for (const password of u.passwords) {
      if (passwordsToUsers[password]) {
        if (!passwordsToUsers[password].includes(u)) {
          passwordsToUsers[password].push(u)
        }
      } else {
        passwordsToUsers[password] = [u]
      }
    }
  })
  // Do the matchmaking
  const pairs = [] as Array<{ first: User; second?: User; password: string }>
  for (const password in passwordsToUsers) {
    // Get users
    const users = passwordsToUsers[password]
    // Make pairs
    while (users.length > 0) {
      // Just one user
      if (users.length < 2) {
        pairs.push({ first: users[0], password })
        users.splice(0, 1)
        continue
      }
      // First user
      const firstUser = users.splice(0, 1)[0]
      // Random second user
      const secondUser = users.splice(
        Math.floor(Math.random() * users.length),
        1
      )[0]
      // Add pair
      pairs.push({ first: firstUser, second: secondUser, password })
    }
  }
  // Send messages
  for (const pair of pairs) {
    // Just one user
    if (!pair.second) {
      const user = pair.first
      try {
        await bot.telegram.sendMessage(
          user.id,
          `Похоже, в этот раз вы остались без пары в сообществе ${
            pair.password
          }! Ничего страшного, в следующий раз вам, скорее всего, повезет больше, если в сообществе с паролем ${
            pair.password
          } больше 1 участника. Сейчас либо их меньше 1, либо количество участников нечетное.

В любом случае, зовите больше людей подключаться по ссылке t.me/${
            (await bot.telegram.getMe()).username
          }?start=${
            pair.password
          }, чтобы такого больше не было! Вместе веселее!`,
          {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }
        )
      } catch (err) {
        // Do nothing
      }
    } else {
      const firstUser = pair.first
      const secondUser = pair.second
      try {
        const sent = await bot.telegram.sendMessage(
          firstUser.id,
          `Откройте профиль вашего собеседника, <a href="tg://user?id=${secondUser.id}">нажав вот здесь</a>. Спишитесь с этим собеседником, договоритесь о времени, когда будет удобно созвониться — и созвонитесь с ним или ней!
          
Я отправил вашему собеседнику и ваш контакт. Следующий собеседник появится через ${frequency} дня. Спасибо за участие в сообществе с паролем ${pair.password}!`,
          {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }
        )
        await bot.telegram.sendMessage(
          firstUser.id,
          `<a href="tg://user?id=${secondUser.id}">Собеседник</a> из ${pair.password} вам ответил?`,
          Extra.markdown()
            .HTML(true)
            .markup(
              Markup.inlineKeyboard([
                Markup.callbackButton('Ответил 👍', `y~${secondUser.id}`),
                Markup.callbackButton('Не ответил 👎', `n~${secondUser.id}`),
              ])
            )
            .inReplyTo(sent.message_id)
        )
      } catch {
        // do nothing
      }
      try {
        const sent = await bot.telegram.sendMessage(
          secondUser.id,
          `Откройте профиль вашего собеседника, <a href="tg://user?id=${firstUser.id}">нажав вот здесь</a>. Спишитесь с этим собеседником, договоритесь о времени, когда будет удобно созвониться — и созвонитесь с ним или ней!
  
Я отправил вашему собеседнику и ваш контакт. Следующий собеседник появится через ${frequency} дня. Спасибо за участие в сообществе с паролем ${pair.password}`,
          {
            parse_mode: 'HTML',
          }
        )
        await bot.telegram.sendMessage(
          secondUser.id,
          `<a href="tg://user?id=${firstUser.id}">Собеседник</a> из ${pair.password} вам ответил?`,
          Extra.markdown()
            .HTML(true)
            .markup(
              Markup.inlineKeyboard([
                Markup.callbackButton('Ответил 👍', `y~${firstUser.id}`),
                Markup.callbackButton('Не ответил 👎', `n~${firstUser.id}`),
              ])
            )
            .inReplyTo(sent.message_id)
        )
      } catch {
        // do nothing
      }
    }
  }
}

const job = new CronJob(`0 0 */${frequency} * *`, () => {
  matchmake()
})
job.start()

export async function actionCallback(ctx: Context) {
  try {
    await ctx.deleteMessage()
    await ctx.answerCbQuery()
  } catch {
    // Do nothing
  }
  const components = ctx.callbackQuery.data.split('~')
  const responded = components[0] === 'y'
  if (responded) {
    return
  }
  const user = await UserModel.findOne({ id: +components[1] })
  if (!user) {
    return
  }
  user.notRespondedTimes++
  await user.save()
  if (user.notRespondedTimes > 2) {
    user.passwords = []
    await user.save()
    await bot.telegram.sendMessage(
      user.id,
      'Похоже, вы уже в третий раз не отвечаете собеседнику. Поэтому мы выключили вам нетворкинг. Если захотите — включите снова. Удачи!'
    )
  }
}
