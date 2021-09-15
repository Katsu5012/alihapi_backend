import { Module,forwardRef } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import {MulterModule} from '@nestjs/platform-express'

@Module({
  imports: [
    TypeOrmModule.forRoot(
      {
        type: "mysql",
        host:"us-cdbr-east-04.cleardb.com",
        port: 3306,
        username: 'b56ccb4ba1d9d2',
        password: "2405f61f",
        database: "heroku_823836e62dce863",
        entities: ["./entity/*.ts"],
        synchronize: true,
        autoLoadEntities: true
      }
    ),
    MulterModule.register({
      dest: './upload',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    forwardRef(()=>UsersModule),
    forwardRef(()=>AuthModule),
    PostsModule,
    LikesModule,
    FollowsModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
