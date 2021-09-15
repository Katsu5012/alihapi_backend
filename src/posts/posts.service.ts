import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from '../entity/posts.entity';
import { Repository,LessThan } from 'typeorm';
import { Users } from '../entity/users.entity';
interface newPosts {
  user: Posts['user'];
  body: string;
}
interface findOne {
  posts_id: Posts['posts_id'];
}
interface deletePost {
  posts_id: Posts['posts_id'];
}
interface returnPost {
  user: Posts['user'];
  body: Posts['body'];
  return_id: Posts['return_id'];
}
interface updateType {
  likes_count: Posts['likes_count'];
  reply_count:Posts['reply_count'];
}
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private readonly postsRepository: Repository<Posts>,
  ) {}
  //新規投稿
  async create(data: newPosts): Promise<Posts> {
    return await this.postsRepository.save(data);
  }
  //idが一致するものを探す
  async findOne(data: findOne): Promise<Posts | undefined> {
    return await this.postsRepository.findOne(data, {
      relations: ['user', 'replies', 'likes'],
    });
  }

  //投稿を削除
  async delete(data: deletePost): Promise<void> {
    await this.postsRepository.delete(data);
  }

  //返信
  async returnPosts(data: returnPost): Promise<Posts> {
    const post = await this.postsRepository.save(data);
    return post;
  }
  async update(posts_id: Posts['posts_id'], data: updateType): Promise<void> {
    await this.postsRepository.update(posts_id, data);
  }
  //投稿を100件時系列順に返す
  async getFirstTimeLine(follows: Users[]) {

    // arrayは二次元配列(フォローが２人以上の場合)
    const array = [];
    for (let i = 0; i < follows.length; i++) {
      const find = await this.postsRepository.find({
        where: { user: follows[i], return_id: null },
        order: { created_at: 'DESC' },
        relations: ['user'],

      });
  

      array.push(find);
    }
    //arrayを１次元配列に変更
    const arrayFlat=array.flat()
    //時系列順に並び替え
    const timeLine:Posts[]=arrayFlat.sort((a:Posts,b:Posts)=>b.posts_id-a.posts_id)

    //
    return timeLine

  }

  
  
}
