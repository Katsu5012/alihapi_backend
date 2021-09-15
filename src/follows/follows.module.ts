import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm'
import {Follows} from '../entity/follows.entity'
import {FollowsController} from './follows.controller'
import {FollowsService} from './follows.service'
import {UsersModule} from '../users/users.module'
@Module({
    imports:[TypeOrmModule.forFeature([Follows]),UsersModule],
    controllers:[FollowsController],
    providers:[FollowsService],
    exports:[FollowsService]
})
export class FollowsModule {
}
