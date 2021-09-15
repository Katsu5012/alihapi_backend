import {Users} from '../../entity/users.entity'
//passwordを返さないUserの型
export type PasswordOmitUser = Omit<Users, 'password'>;

