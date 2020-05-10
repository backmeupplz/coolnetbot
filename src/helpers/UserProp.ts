import { User } from '../models/User'
import { DocumentType } from '@typegoose/typegoose'

export interface UserProp {
  dbuser: DocumentType<User>
}
