import { Strategy as BaseLocalStrategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Users } from '../entity/users.entity';
import { PasswordOmitUser } from '../users/DTO/PasswordOmitUser.dto';
@Injectable()
export class LocalStrategy extends PassportStrategy(BaseLocalStrategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField:'user_id', 
      passwordField:undefined
    });
  }

  async validate(
    user_id: Users['user_id'],
    password: Users['password'],
  ): Promise<PasswordOmitUser> {

    const user = await this.authService.validateUser(user_id, password);

console.log(user)
    if (!user) {
      throw new UnauthorizedException('incorrect'); // 認証失敗
    }

    return user;
  }
}
