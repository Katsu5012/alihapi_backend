import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Generated,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  AfterLoad,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import {Posts} from './posts.entity'
import {Follows} from './follows.entity'
import {Likes} from './likes.entity'
@Entity('users')
export class Users {

  @PrimaryGeneratedColumn()
  readonly id!: number;
  @Column()
  @Generated('uuid')
  user_uuid!: string;
  @Column({ default: null,unique: true })
  user_id!: string;
  @Column({nullable: false})
  user_name!: string;
  @Column({default: null})
  self_introduction!: string;
  @Column({ default: null })
  @Exclude()
  password!: string;
  @Column({ default: null })
  background_image!: string;
  @Column({default:null})
  background_image_key!: string;
  @Column({ default: null })
  user_image!: string;
  @Column({default: null})
  user_image_key!:string;
  @Column({ default: false })
  is_followed!: boolean;
  @Column({ default: 0 })
  follow_count!: number;
  @Column({ default: 0 })
  follower_count!: number;
  @CreateDateColumn()
  created_at!: Date;
  @UpdateDateColumn()
  updated_at!: Date;
  @OneToMany(()=>Posts,(posts:Posts)=>posts.user,{cascade:true})
  posts!:Posts[]
  @OneToMany(()=>Follows,(follows:Follows)=>follows.follow_user,{cascade:true})
  follows!:Follows[]
  @OneToMany(()=>Follows,(follows:Follows)=>follows.followed_user,{cascade:true})
  followers!:Follows[]
  @OneToMany(()=>Likes,(likes:Likes)=>likes.user,{cascade:true})
  likes!:Likes[]

 

}
