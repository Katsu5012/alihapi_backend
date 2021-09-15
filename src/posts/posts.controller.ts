import {
  Body,
  Req,
  Controller,
  Post,
  UseGuards,
  ValidationPipe,
  NotFoundException,
  BadRequestException,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';
import { newPosts } from './DTO/newPosts.dto';
import { JwtPayload } from '../auth/DTO/JWTPayload.dto';
import { UsersService } from 'src/users/users.service';
import { Users } from '../entity/users.entity';
import { Posts } from '../entity/posts.entity';
import { returnPost } from './DTO/returnPost.dto';
@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  //新規投稿
  async posts(
    @Body(new ValidationPipe()) newposts: newPosts,
    @Req() request: { user: JwtPayload },
  ) {
    const user: Users | undefined = await this.usersService.findUser({
      user_uuid: request.user.user_uuid,
    });
    if (user === undefined) {
      throw new NotFoundException('user is not found');
    }
    const posts: Posts = await this.postsService.create({
      user: user,
      body: newposts.body,
    });
    if (!posts) {
      throw new Error();
    }
    return posts;
  }
//該当の投稿を取得
@UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getPosts(@Param('id') id: Posts['posts_id'],@Req() request: { user: JwtPayload }) {
    const me=await this.usersService.findUser({id:request.user.id});
    if(!me){
      throw new NotFoundException("not found")
    }
    console.log(me.likes)
    const getPosts = await this.postsService.findOne({ posts_id: id });
    if (!getPosts) {
      throw new NotFoundException();
    }
    for(let i=0;i<me.likes.length;i++){
for(let j=0;j<getPosts.likes.length;j++){

  if(me.likes[i].likes_id ===getPosts.likes[j].likes_id){
getPosts.is_likes=true
  }
}
    }
    console.log(getPosts)
    const likesCount = getPosts.likes.length;
    const replyCount =getPosts.replies.length;
    getPosts.likes_count = likesCount;
    await this.postsService.update(id, { likes_count: likesCount,reply_count: replyCount});
    return getPosts;
  }
  //投稿を削除
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deletePosts(
    @Param('id') id: Posts['posts_id'],
    @Req() request: { user: JwtPayload },
  ) {
    const post = await this.postsService.findOne({ posts_id: id });
    //投稿がない時
    if (post === undefined) {
      throw new NotFoundException();
    }
    //tokenに含まれるidと投稿のuser.idが違う時
    if (post.user.id !== request.user.id) {
      throw new BadRequestException();
    }
    //投稿を削除
    await this.postsService.delete({ posts_id: post.posts_id });
    return { message: 'success' };
  }

  //一致するidに返信
  @Post(':id')
  @UseGuards(AuthGuard('jwt'))
  async returnPost(
    @Param('id') id: number,
    @Body(new ValidationPipe()) returnpost: returnPost,
    @Req() request: { user: JwtPayload },
  ) {
    const posts = await this.postsService.findOne({ posts_id: id });
    if (!posts) {
      throw new NotFoundException();
    }
    const user = await this.usersService.findUser({
      user_uuid: request.user.user_uuid,
    });
    if (!user) {
      throw new NotFoundException();
    }
  //返信先のreply_countを１増やす
const replyCount=posts.reply_count +1
await this.postsService.update(id,{likes_count:posts.likes.length,reply_count:replyCount})
//投稿を登録
    const returnPosts = await this.postsService.returnPosts({
      user: user,
      body: returnpost.body,
      return_id: id,
    });
    return returnPosts;
  }
}
