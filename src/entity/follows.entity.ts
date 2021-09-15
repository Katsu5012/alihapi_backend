import { Entity,ManyToOne,PrimaryGeneratedColumn,JoinColumn,CreateDateColumn } from "typeorm";
import {Users} from './users.entity'
@Entity('follows')
export class Follows{
@PrimaryGeneratedColumn()
readonly follows_id!:number;
@ManyToOne(()=>Users,(user:Users)=>user.posts, {
    nullable: false,
    onDelete:"CASCADE",
    orphanedRowAction: "delete",
eager:true
  })
@JoinColumn({name:'follow_user',referencedColumnName:'id'})
follow_user!:Users;
@ManyToOne(()=>Users,(user:Users)=>user.posts, {
    nullable: false,
    onDelete:"CASCADE",
    orphanedRowAction: "delete",
eager:true
  })
@JoinColumn({name:'followed_user',referencedColumnName:'id'})
followed_user!:Users;
@CreateDateColumn()
created_at!:Date;


}