import { UserModel, User } from '../models/User'
import { DocumentType } from '@typegoose/typegoose'
import { bot } from './bot'
const CronJob = require('cron').CronJob

export async function matchmake() {
  // Get and filter users
  const users = (await UserModel.find({ password: { $exists: true } })).filter(
    (u) => !!u.password
  )
  // Get passwords to list of users
  const passwordsToUsers = {} as { [index: string]: DocumentType<User>[] }
  users.forEach((u) => {
    if (passwordsToUsers[u.password]) {
      passwordsToUsers[u.password].push(u)
    } else {
      passwordsToUsers[u.password] = [u]
    }
  })
  // Do the matchmaking
  const pairs = [] as Array<Array<DocumentType<User>>>
  for (const password in passwordsToUsers) {
    // Get users
    const users = passwordsToUsers[password]
    // Make pairs
    while (users.length > 0) {
      // Just one user
      if (users.length < 2) {
        pairs.push([users[0]])
        users.splice(0, 1)
        continue
      }
      // First user
      const firstUser = users.splice(0, 1)[0]
      // Random second user
      const secondUser = users.splice(
        Math.floor(Math.random() * (users.length - 1)),
        1
      )[0]
      // Add pair
      pairs.push([firstUser, secondUser])
    }
  }
  console.log(pairs.map((p) => p.map((u) => `${u.id} ${u.password}`)))
  // Send messages
  for (const pair of pairs) {
    // Just one user
    if (pair.length < 2) {
      const user = pair[0]
      bot.telegram.sendMessage(
        user.id,
        `Похоже, в этот раз вы остались без пары! Ничего страшного, в следующий раз вам, скорее всего, повезет больше, если в сообществе с паролем ${user.password} больше 1 участника. Либо их меньше 1, либо количество участников нечетное.

В любом случае, зовите больше людей подключаться командой /network ${user.password}, чтобы такого больше не было! Вместе веселее!`,
        {
          parse_mode: 'HTML',
        }
      )
    } else {
      const firstUser = pair[0]
      const secondUser = pair[1]
      bot.telegram.sendMessage(
        firstUser.id,
        `Откройте профиль вашего собеседника, <a href="tg://user?id=${secondUser.id}">нажав вот здесь</a>. Спишитесь с этим собеседником, договоритесь о времени, когда будет удобно созвониться — и созвонитесь с ним или ней!
        
Я отправил вашему собеседнику и ваш контакт. Следующий собеседник появится через 2 дня. Спасибо за участие в сообществе с паролем ${firstUser.password}!`,
        {
          parse_mode: 'HTML',
        }
      )
      bot.telegram.sendMessage(
        secondUser.id,
        `Откройте профиль вашего собеседника, <a href="tg://user?id=${firstUser.id}">нажав вот здесь</a>. Спишитесь с этим собеседником, договоритесь о времени, когда будет удобно созвониться — и созвонитесь с ним или ней!

Я отправил вашему собеседнику и ваш контакт. Следующий собеседник появится через 2 дня. Спасибо за участие в сообществе с паролем ${secondUser.password}`,
        {
          parse_mode: 'HTML',
        }
      )
    }
  }
}

const job = new CronJob('0 0 */2 * *', () => {
  matchmake()
})
job.start()
