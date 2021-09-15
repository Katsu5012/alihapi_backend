import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../auth/DTO/JWTPayload.dto';
import { Users } from '../entity/users.entity';
@Controller('follows')
export class FollowsController {
  constructor(
    private readonly followsService: FollowsService,
    private readonly usersService: UsersService,
  ) {}
  //新規フォロー
  @Post(':id')
  @UseGuards(AuthGuard('jwt'))
  async newFollow(
    @Req() request: { user: JwtPayload },
    @Param('id') id: Users['id'],
  ) {
    //パラメーターで渡ってくるidがフォローされる人のid,request.idが自身のid
    //フォローする人(自分の情報）を取得
    const follow = await this.usersService.findUser({ id: request.user.id });
    if (!follow) {
      throw new NotFoundException('User not found');
    }
    //フォローされる人の情報を取得
    const followed = await this.usersService.findUser({ id: id });
    if (!followed) {
      throw new NotFoundException('User not found');
    }
    //過去にフォローしていないかチェック
    const checkFollow = await this.followsService.findOne({
      follow_user: follow,
      followed_user: followed,
    });
    if (checkFollow) {
      throw new BadRequestException('already followed');
    }
    const newFollow = await this.followsService.create({
      follow_user: follow,
      followed_user: followed,
    });
    if (newFollow) {
      return { message: 'success' };
    }
  }
  //フォロー解除
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteFollows(
    @Req() request: { user: JwtPayload },
    @Param('id') id: Users['id'],
  ) {
    //パラメーターで渡ってくるidがフォローする人のid,request.idが自身のid
    //フォロー解除する人(自分の情報）を取得
    const follow = await this.usersService.findUser({ id: request.user.id });

    if (!follow) {
      throw new NotFoundException('User not found');
    }

    //フォロー解除される人の情報を取得
    const followed = await this.usersService.findUser({ id: id });

    if (!followed) {
      throw new NotFoundException('User not found');
    }
    //過去にフォローしていないかチェック
    const checkFollow = await this.followsService.findOne({
      follow_user: follow,
      followed_user: followed,
    });
    if (!checkFollow) {
      throw new BadRequestException('not followed');
    }
    await this.followsService.delete(checkFollow);
    return { message: 'success' };
  }
  //フォロワー全取得
  @Get(':user_id/followers')
  async getFollowers(@Param('user_id') user_id: Users['user_id']) {
      const user=await this.usersService.findOne({ user_id:user_id})
      if(!user){
          throw new NotFoundException('User not found');
      }
      const findAll = await this.followsService.findAll({followed_user:user})
      return findAll

  }

  //フォロー全取得
  @Get(':user_id/follows')
  async getFollows(@Param('user_id') user_id: Users['user_id']) {
    const user=await this.usersService.findOne({ user_id:user_id})
    if(!user){
        throw new NotFoundException('User not found');
    }
    const findAll = await this.followsService.findAll({follow_user:user})
    return findAll
  }
}
