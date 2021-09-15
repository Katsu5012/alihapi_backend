import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entity/users.entity';
import { Repository, Like } from 'typeorm';
import { PasswordOmitUser } from './DTO/PasswordOmitUser.dto';
import { createUser } from './DTO/createUser.dto';
interface idData {
  id: Users['id'];
  
}
interface create {
  user_name: createUser['user_name'];

}
interface AuthData {
  user_id: Users['user_id'];
}
interface Data {
  user_uuid: Users['user_uuid'];
}
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}
  //新規登録のみ使う//

  async create(data: create): Promise<PasswordOmitUser | undefined> {
    //user_nameを登録
    const user: Users = await this.usersRepository.save(data);

    //user_idを返ってきたuser_uuidから作成

    const userId: string = user.user_uuid.split('-').join('').substr(0, 15);
    //user_idを登録

    await this.usersRepository.update(user.id, {
      user_id: userId,
    });
    //user情報を返す
    const process = await this.usersRepository.findOne({
      user_uuid: user.user_uuid,
    });
    if (process === undefined) {
      throw new NotFoundException('user is not found');
    }

    const { password, ...result } = process;

    return result;
  }

  //１人のuser情報を返す,user_idで探す
  async findOne(data: AuthData): Promise<Users | undefined> {
    let user = await this.usersRepository.findOne(data, {
      relations: ['posts', 'follows', 'followers', 'likes'],
    });
    if (user) {
      user.follow_count = user.follows.length;
      user.follower_count = user.followers.length;
      return user;
    }
    return undefined;
  }

  //１人のuser情報を返す,user_uuidで探す
  async findUser(data: Data | idData): Promise<Users | undefined> {
    const user = await this.usersRepository.findOne(data, {
      relations: ['follows', 'followers', 'likes'],
    });
    return user;
  }

  //user情報の編集,送られてくる型がバラバラなためanyで対応
  async edit(id: PasswordOmitUser['id'], data: any): Promise<any> {
    const result = await this.usersRepository.update(id, data);
    return result;
  }

  async deleteMe(data: Users): Promise<Users> {
    return await this.usersRepository.remove(data);
  }
  async popular(): Promise<Users[]> {
    return await this.usersRepository.find({
      order: { follower_count: 'DESC' },
      relations: ['followers'],
      take: 50,
    });
  }
  async searchUser(data: string): Promise<Users[]> {


   return  await this.usersRepository.find({
      where: [{ user_name: Like(`%${data}%`) }, { user_id: Like(`%${data}%`) }],
    });
  
  }
}
