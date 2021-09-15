import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException} from '@nestjs/common';
import { Users } from 'src/entity/users.entity';
import { UsersService } from 'src/users/users.service';
import {PasswordOmitUser} from '../users/DTO/PasswordOmitUser.dto'
import {JwtPayload} from './DTO/JWTPayload.dto'


@Injectable()
export class AuthService {
    constructor (private readonly jwtService: JwtService,private readonly usersService: UsersService){}

    async validateUser(user_id:Users['user_id'],password:Users['password']):Promise<PasswordOmitUser | null>{

        const user=await this.usersService.findOne({user_id: user_id})

        if (user && bcrypt.compareSync(password, user.password)) {

            const { password, ...result } = user; // パスワード情報を外部に出さないようにする
      
            return result;
          }
        return null

    }

    async login(user:PasswordOmitUser):Promise<string> {
        const payload:JwtPayload={id:user.id,user_uuid:user.user_uuid}
        return this.jwtService.sign(payload)
    }

}