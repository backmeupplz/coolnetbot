import { frequency } from './../helpers/frequency'
import { TelegrafContext } from 'telegraf/typings/context'

export function sendHelp(ctx: TelegrafContext) {
  return ctx.replyWithHTML(
    `Привет! Этот бот позволяет вам участвовать в секретных нетворкинг-сессиях разных сообществ!

Просто введите <code>/network пароль_коммьюнити</code>, чтобы начать нетворкинг в вашем коммьюнити. Командой <code>/network пароль_коммьюнити</code> можно подключаться к нескольким коммьюнити сразу. Командой <code>/nonetwork пароль_коммьюнити</code> вы можете отключить нетворкинг в определенном коммьюнити. Чтобы отключить нетворкинг во всех коммьюнити, отправьте команду <code>/nonetwork</code>.

Присылать <code>/network пароль_коммьюнити</code> можно сколько угодно раз — больше одного контакта на каждое сообщество каждые ${frequency} дня вам не будет выдаваться. Однако в ответ на эту команду бот всегда будет присылать актуальное количество людей в сообществе. <code>/networks</code> даст список сообществ, в которых вы состоите.

Дальше @coolnetbot будет раз в ${frequency} дня присылать вам контакт человека, с которым вам нужно связаться и договориться о времени, когда вы проведете с ним (или ней) 15 минут за чашечкой кофе, чая, воды или что вы там пьете. Не волнуйтесь, этому человеку пришлют и ваш контакт — так что они будут подготовлены.

Можете созваниваться прямо тут, в Телеграме — а можете в том же Google Meet или где-нибудь еще. Главное, не используйте Zoom — в этом дырявом решете каждую неделю находят минимум одну новую уязвимость.

<b>Не стесняйтесь писать первыми, все участники этого бота дают согласие на то, чтобы вы написали!</b>

Код этого бота находится <a href="https://github.com/backmeupplz/coolnetbot">в открытом доступе</a>.`,
    {
      disable_web_page_preview: true,
    }
  )
}
