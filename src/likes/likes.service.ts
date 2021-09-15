import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Likes } from '../entity/likes.entity';
import { Users } from '../entity/users.entity';
import { Posts } from '../entity/posts.entity';
interface Create {
  user: Users;
  post: Posts;
}
interface findOneType{user:Users,post: Posts} 
interface FindAll{post: Posts}
@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Likes)
    private readonly likesRepository: Repository<Likes>,
  ) {}
  async create(data: Create): Promise<Likes> {
    return await this.likesRepository.save(data);
  }

  async delete(data: Likes): Promise<any> {
      return await this.likesRepository.remove(data);
  }
  async findOne(data:findOneType):Promise<Likes | undefined> {
      return await this.likesRepository.findOne(data,{relations:['post','user']})
  }
  async findAll(data:FindAll):Promise<Likes[]>{
 return await this.likesRepository.find({where:data,relations:['user','post']})
  }
}
