import { ExtractJwt, Strategy as BaseJwtStrategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from './DTO/JWTPayload.dto';
import {Request} from 'express'
@Injectable()
export class JwtStrategy extends PassportStrategy(BaseJwtStrategy) {
  constructor(readonly  configService: ConfigService) {
    super({
      // Authorization bearerからトークンを読み込む関数を返す
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([(request:Request)=>{
        return request.cookies.access_token;
      }]),
      // 有効期間を無視するかどうか
      ignoreExpiration: false,
      // envファイルから秘密鍵を渡す
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
      // secretOrKey:process.env.JWT_SECRET_KEY,
    });

  }
  async validate(payload: JwtPayload): Promise<JwtPayload> {

    return { id: payload.id, user_uuid: payload.user_uuid };
  }
}
