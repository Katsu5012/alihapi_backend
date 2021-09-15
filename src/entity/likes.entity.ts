import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { Posts } from './posts.entity';
@Entity('likes')
export class Likes {
  @PrimaryGeneratedColumn()
 readonly likes_id!: number;
  //いいねした人
  @ManyToOne(() => Users, (user: Users) => user.likes, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',

  })
  @JoinColumn({ name: 'user', referencedColumnName: 'id' })
  user!: Users;
  //いいねした投稿
  @ManyToOne(() => Posts, (post: Posts) => post.likes, {
    nullable: false,
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
eager: true,
  })
  @JoinColumn({ name: 'posts_id', referencedColumnName: 'posts_id' })
  post!: Posts;
  @CreateDateColumn()
  created_at!: Date;
}
