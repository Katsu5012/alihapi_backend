import {
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
  NotFoundException,
  Get,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LikesService } from './likes.service';
import { JwtPayload } from '../auth/DTO/JWTPayload.dto';
import { Likes } from '../entity/likes.entity';
import { Posts } from '../entity/posts.entity';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';
@Controller('likes')
export class LikesController {
  constructor(
    private readonly likesService: LikesService,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}
  //新規いいね
  @UseGuards(AuthGuard('jwt'))
  @Post(':posts_id')
  async newLikes(
    @Param('posts_id') posts_id: Posts['posts_id'],
    @Req() request: { user: JwtPayload },
  ) {
    //いいねしたuserを取得
    const user = await this.usersService.findUser({
      user_uuid: request.user.user_uuid,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //いいねした投稿を取得
    const post = await this.postsService.findOne({ posts_id: posts_id });
    if (!post) {
      throw new NotFoundException('post not found');
    }
    //すでにいいねしていないか確認
    const findOne = await this.likesService.findOne({ user: user, post: post });
    if (findOne) {
      throw new BadRequestException();
    }
    //新規いいねを作成

    const newLike = await this.likesService.create({
      user: user,
      post: post,
    });
    if (!newLike) {
      throw new Error();
    }
    //いいねされたことを投稿に反映
    const likesCount=post.likes.length+1
    await this.postsService.update(post.posts_id, {
      likes_count: likesCount,
      reply_count: post.replies.length
    });
    return newLike;
  }
  //該当の投稿のいいねを全取得
  @UseGuards(AuthGuard('jwt'))
  @Get(':posts_id')
  async getLikesInPost(
    @Param('posts_id') posts_id: Posts['posts_id'],
    @Req() request: { user: JwtPayload },
  ) {
    //いいねしたuserを取得
    const user = await this.usersService.findUser({
      user_uuid: request.user.user_uuid,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //いいねした投稿を取得
    const post = await this.postsService.findOne({ posts_id: posts_id });
    if (!post) {
      throw new NotFoundException('post not found');
    }
    //いいねを全て返す
    const getALLLikes = await this.likesService.findAll({ post: post });
    return getALLLikes;
  }
  //いいねを削除
  @UseGuards(AuthGuard('jwt'))
  @Delete(':posts_id')
  async deleteLikesInPost(
    @Param('posts_id') posts_id: Posts['posts_id'],
    @Req() request: { user: JwtPayload },
  ) {
    const user = await this.usersService.findUser({
      user_uuid: request.user.user_uuid,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const post = await this.postsService.findOne({ posts_id: posts_id });
    if (!post) {
      throw new NotFoundException('post not found');
    }
    //いいねを押しているか確認
    const like = await this.likesService.findOne({ user: user, post: post });
    if (like === undefined) {
      throw new NotFoundException();
    }
    //いいねを消す
    await this.likesService.delete(like);
    //いいねが取り消されたことを投稿に反映
    const likesCount=post.likes.length-1
    await this.postsService.update(post.posts_id, {
      likes_count: likesCount,
      reply_count:post.replies.length,
    });
    return { message: 'success' };
  }
}
