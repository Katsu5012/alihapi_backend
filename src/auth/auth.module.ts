import { Module,forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import {JwtModule} from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config';

@Module({
  imports:[forwardRef(()=>UsersModule),PassportModule,JwtModule.registerAsync({
    useFactory: async (configService: ConfigService) => {
      return {
        // envファイルから秘密鍵を渡す
        secret: configService.get<string>('JWT_SECRET_KEY'), 
        signOptions: { 
          // 有効期間
          expiresIn: '1d' 
        },
      };
    },
    inject: [ConfigService], // useFactoryで使う為にConfigServiceを注入する
  })],

  providers: [AuthService,LocalStrategy,JwtStrategy],
  exports:[AuthService]
})
export class AuthModule {}
