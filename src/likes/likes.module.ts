import { Module,forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Likes } from 'src/entity/likes.entity';
import {LikesService} from './likes.service'
import {LikesController} from './likes.controller'
import {UsersModule} from '../users/users.module'
import {PostsModule} from '../posts/posts.module'
import { Users } from 'src/entity/users.entity';
@Module({
    imports:[TypeOrmModule.forFeature([Likes]),forwardRef(()=>UsersModule),PostsModule],
    controllers:[LikesController],
    providers:[LikesService],
    exports:[LikesService]
})
export class LikesModule {}
