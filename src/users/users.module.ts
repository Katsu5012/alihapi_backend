import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entity/users.entity';
import { PostsModule } from '../posts/posts.module';
import { LikesModule } from '../likes/likes.module';
import { S3Service } from './s3.service';
import { S3Module } from 'nestjs-s3';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    forwardRef(() => AuthModule),
    forwardRef(() => PostsModule),
    forwardRef(() => LikesModule),
    S3Module.forRoot({
      config: {
        accessKeyId: 'minio',
        secretAccessKey: 'password',
        endpoint: 'http://127.0.0.1:9000',
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
      },
    })
  ],
  controllers: [UsersController],
  providers: [UsersService, S3Service],
  exports: [UsersService],
})
export class UsersModule {}
