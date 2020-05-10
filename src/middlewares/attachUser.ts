import { findUser } from '../models'
import { TelegrafContext } from 'telegraf/typings/context'
import { UserProp } from '../helpers/UserProp'

export async function attachUser(ctx: TelegrafContext & UserProp, next) {
  const dbuser = await findUser(ctx.from.id)
  ctx.dbuser = dbuser
  next()
}
