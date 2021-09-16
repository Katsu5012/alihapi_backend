import {
  Controller,
  Post,
  ValidationPipe,
  Body,
  Res,
  Put,
  BadRequestException,
  UseGuards,
  Req,
  Delete,
  Get,
  NotFoundException,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Users } from '../entity/users.entity';
import { PasswordOmitUser } from './DTO/PasswordOmitUser.dto';
import { Response } from 'express';
import { editMe } from './DTO/editMe.dto';
import { newPass } from './DTO/newPass.dto';
import { changePass } from './DTO/changePass.dto';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth/auth.service';
import { createUser } from './DTO/createUser.dto';
import { JwtPayload } from '../auth/DTO/JWTPayload.dto';
import { PostsService } from '../posts/posts.service';
import { LikesService } from '../likes/likes.service';
import { Likes } from '../entity/likes.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { Request } from 'express';
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly postsService: PostsService,
    private readonly likesService: LikesService,
    private readonly s3Service: S3Service,
  ) {}
  //check
  @Post()
  async createUser(
    @Body(new ValidationPipe()) createuser: createUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    let user: PasswordOmitUser | undefined = await this.usersService.create({
      user_name: createuser.user_name,
 
    });
    if (user === undefined) {
      throw new Error('error');
    }
    //tokenを生成して返す
    const token = await this.authService.login(user);
    response.cookie('access_token', token, { httpOnly: true,secure: true ,sameSite:"none"});
    return {user:user,access_token:token};
  }
  //check
  @UseGuards(AuthGuard('jwt'))
  @Put('me')
  async editMe(
    @Body(new ValidationPipe()) editme: editMe,
    @Req() request: { user: JwtPayload },
  ) {
    await this.usersService.edit(request.user.id, {
      user_id: editme.user_id,
      user_name: editme.user_name,
      self_introduction: editme.self_introduction,
    });
    return await this.usersService.findUser({ id: request.user.id });
  }

  //ログイン後に返す
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Req() request: { user: JwtPayload }) {
    //ユーザー情報を取得（フォローしている人,,いいねを押した投稿の一覧も取得済）

    let user = await this.usersService.findUser({ id: request.user.id });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const follows: Users[] = [];
    follows.push(user);

    for (let i = 0; i < user.follows.length; i++) {
      follows.push(user.follows[i].followed_user);
    }

    const likes: Likes[] = user.likes;
    //フォローしている人の投稿を100件取得
    let timeLines = await this.postsService.getFirstTimeLine(follows);

    //取得してきた投稿に自分がいいねしているかチェック
    for (const like of likes) {
      for (const timeLine of timeLines) {
        if (like.post.posts_id === timeLine.posts_id) {
          timeLine.is_likes = true;
        }
      }
    }

    //フォロー,フォロワーの人数を出す
    const followCount = follows.length;
    const followerCount = user.followers.length;
    user.follow_count = followCount;
    user.follower_count = followerCount;

    //フォロー、フォロワーの人数を変更したことをデータベースに保存
    await this.usersService.edit(user.id, {
      follow_count: followCount,
      follower_count: followerCount,
    });

    return { user: user, timeLines: timeLines };
  }

  //check
  @UseGuards(AuthGuard('jwt'))
  @Delete('me')
  async deleteMe(@Req() request: { user: JwtPayload }) {
    const user: Users | undefined = await this.usersService.findUser({
      user_uuid: request.user.user_uuid,
    });
    if (user !== undefined) {
      //アカウント削除
      await this.usersService.deleteMe(user);
      //s3に登録している画像削除
      await this.s3Service.delete(user.user_image_key);
     await this.s3Service.delete(user.background_image_key);
      return { message: 'delete user' };
    } else {
      throw new BadRequestException('invalid error');
    }
  }
  //user_imageを登録する
  @UseGuards(AuthGuard('jwt'))
  @Post('me/user_image')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadUserImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
    @Req() req: { user: JwtPayload },
  ) {
    const name = `${req.user.user_uuid}_user_image`;
    const user = await this.usersService.findUser({ id: req.user.id });
    if (user!.user_image_key !== null) {
      await this.s3Service.delete(user!.user_image_key);
      const response = await this.s3Service.uploadFile(request.files, name);

      const res=await this.usersService.edit(req.user.id, {
        user_image: response!.Location,
        user_image_key: response!.Key,
      });
      return res
    }

    const response = await this.s3Service.uploadFile(request.files, name);

    await this.usersService.edit(req.user.id, {
      user_image: response!.Location,
      user_image_key: response!.Key,
    });
    return { message: 'success' };
  }
  //user_imageを削除
  @UseGuards(AuthGuard('jwt'))
  @Delete('me/user_image')
  async deleteUserImage(@Req() request: { user: JwtPayload }) {
    const user = await this.usersService.findUser({ id: request.user.id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const response = await this.s3Service.delete(user.user_image_key);
    console.log(response);
    await this.usersService.edit(request.user.id, {
      user_image:null,
      user_image_key:null
    });
    return await this.usersService.findUser({ id: request.user.id });
  }
  //背景画像を登録
  @UseGuards(AuthGuard('jwt'))
  @Post('me/background_image')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadBackgroundImage(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
    @Req() req: { user: JwtPayload },
  ) {
    const name = `${req.user.user_uuid}_background_image`;
    const user = await this.usersService.findUser({ id: req.user.id });
    if (user!.background_image_key !== null) {
      await this.s3Service.delete(user!.background_image_key);
      const response = await this.s3Service.uploadFile(request.files, name);

      await this.usersService.edit(req.user.id, {
        background_image: response!.Location,
        background_image_key: response!.Key,
      });
      return { message: 'success' };
    }
    const response = await this.s3Service.uploadFile(request.files, name);

    await this.usersService.edit(req.user.id, {
      background_image: response!.Location,
      background_image_key: response!.Key,
    });
    return { message: 'success' };
  }
  //背景画像を削除
  @UseGuards(AuthGuard('jwt'))
  @Delete('me/background_image')
  async deleteBackgroundImage(@Req() request: { user: JwtPayload }) {
    const user = await this.usersService.findUser({ id: request.user.id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.s3Service.delete(user.background_image_key);

    await this.usersService.edit(request.user.id, {
      background_image:null,
      background_image_key:null
    });
    return await this.usersService.findUser({ id: request.user.id });
  }
  //check
  @UseGuards(AuthGuard('jwt'))
  @Put('me/change_password')
  async changePass(
    @Body(new ValidationPipe()) changepass: changePass,
    @Req() request: { user: JwtPayload },
  ) {
    if (!(changepass.newPassword = changepass.comfirmedPassword)) {
      throw new BadRequestException('invalid error');
    }
    //パスワードが必要なのでpasswordごとユーザー情報をとってくる
    const user: Users | undefined = await this.usersService.findUser({
      user_uuid: request.user.user_uuid,
    });
    if (user === undefined) {
      throw new NotFoundException('user is not found');
    }

    const isCorrectPass: boolean = await bcrypt.compare(
      changepass.nowPassword,
      user.password,
    );
    //パスワードが正しいかチェック
    if (!isCorrectPass) {
      throw new BadRequestException('incorrect password');
    }
    //パスワードが初回登録されているかチェック
    if (isCorrectPass === null) {
      throw new Error('you are not registerd password');
    }
    const hashedPassword = await bcrypt.hash(changepass.newPassword, 12);
    const changePass = await this.usersService.edit(user.id, {
      password: hashedPassword,
    });
    if (changePass) {
      return { message: 'changed password' };
    }
  }
  //check
  //新規パスワードを作成
  @UseGuards(AuthGuard('jwt'))
  @Put('me/new_password')
  async newPassword(
    @Body(new ValidationPipe()) newpass: newPass,
    @Req() request: { user: JwtPayload },
  ) {
    const user: Users | undefined = await this.usersService.findUser({
      user_uuid: request.user.user_uuid,
    });
    if (user === undefined) {
      throw new NotFoundException('user is not found');
    }
    //パスワードが登録されていないかチェック
    if (user.password !== null) {
      throw new BadRequestException('you are already registerd passsword');
    }
    //パスワードをhash化
    const hashedPassword = await bcrypt.hash(newpass.password, 12);
    const registerPass = await this.usersService.edit(user.id, {
      password: hashedPassword,
    });

    if (!registerPass) {
      throw new Error();
    }

    return { message: 'registerd password' };
  }
  //check
  //１人のユーザー情報を取得する
  @UseGuards(AuthGuard('jwt'))
  @Get(':user_id')
  async getUser(
    @Param('user_id') user_id: Users['user_id'],
    @Req() request: { user: JwtPayload },
  ) {
    const findUser = await this.usersService.findOne({ user_id: user_id });

    const me = await this.usersService.findUser({ id: request.user.id });

    if (!me) {
      throw new Error();
    }

    if (findUser === undefined) {
      throw new NotFoundException('findUser is not found');
    }

    console.log(findUser);
    for (let i = 0; i < me.follows.length; i++) {
      if (me.follows[i].followed_user.user_id === findUser.user_id) {
        console.log(me.follows[i].followed_user.user_id);

        findUser.is_followed = true;
      }
    }
    //投稿の中にいいねしているものがあるか調べる
    for (let i = 0; i < me.likes.length; i++) {
      for (let j = 0; j < findUser.posts.length; j++) {
        if (me.likes[i].post.posts_id === findUser.posts[j].posts_id) {
          findUser.posts[j].is_likes = true;
        }
      }
    }
    //フォロー、フォロワーの人数を変更したことをデータベースに保存
    const followCount = findUser.follows.length;
    const followerCount = findUser.followers.length;
    findUser.follow_count = followCount;
    findUser.follower_count = followerCount;
    await this.usersService.edit(findUser.id, {
      follow_count: followCount,
      follower_count: followerCount,
    });
    const { password, ...result } = findUser;

    return result;
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('i/popular')
  async getPopular() {
    console.log('1');
    return await this.usersService.popular();
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('i/search')
  async findU(@Query() query: { keywords: string }) {
    const findU = await this.usersService.searchUser(query.keywords);
    return findU;
  }
}
