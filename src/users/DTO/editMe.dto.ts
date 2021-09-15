import { IsString, Length } from "class-validator";

export class editMe{
    @IsString()
    @Length(4,15)
    user_id!:string;
    @IsString()
    @Length(1,20)
    user_name!:string;
    @IsString()
    @Length(0,100)
    self_introduction!:string;
}