import { Length,IsString } from "class-validator";

export class createUser{
@IsString()
@Length(1,20)
user_name!:string;
}