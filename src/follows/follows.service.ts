import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm'
import {Follows} from '../entity/follows.entity'
import {Users} from '../entity/users.entity'
interface Data{follow_user:Users,followed_user:Users}
interface follows{follow_user:Users}
interface followers{followed_user:Users}
@Injectable()
export class FollowsService {
    constructor(@InjectRepository(Follows)private readonly followsRepository:Repository<Follows>){}

    async findOne(data:Data): Promise<Follows | undefined>{
return await this.followsRepository.findOne(data)
    }
    async create(data:Data): Promise<Follows>{
        return this.followsRepository.save(data)
    }
    async delete(data:Follows): Promise<void>{
        await this.followsRepository.remove(data)
    }
    async findAll(data:follows | followers): Promise<Follows[]>{
        return this.followsRepository.find(data)
    }
}
