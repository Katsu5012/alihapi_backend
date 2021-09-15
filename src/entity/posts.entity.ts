import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Users } from './users.entity';
import { Likes } from './likes.entity';
@Entity('posts')
export class Posts {
  @PrimaryGeneratedColumn()
  readonly posts_id!: number;
  @ManyToOne(() => Users, (user: Users) => user.posts, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
 eager:true
  })
  @JoinColumn({ name: 'users_primary_id', referencedColumnName: 'id' })
  user!: Users;

  @Column({ nullable: false })
  body!: string;
  @Column({ default: 0 })
  likes_count!: number;
  @Column({ default: false })
  is_likes!: boolean;
  @Column({default:0})
  reply_count!:number;
  @CreateDateColumn()
  created_at!: Date;
  @ManyToOne(() => Posts, (posts: Posts) => posts.posts_id,{
    nullable: true,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'return_id', referencedColumnName: 'posts_id' })
  return_id!: number;
  @OneToMany(() => Posts, (posts: Posts) => posts.return_id,{cascade:true})
  replies!: Posts[];
  @OneToMany(() => Likes, (likes: Likes) => likes.post, { cascade: true})
  likes!: Likes[];

 
}
