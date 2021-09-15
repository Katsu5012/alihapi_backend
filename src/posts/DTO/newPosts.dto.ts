import {IsInt, IsString,Length} from "class-validator";
export class newPosts{
@IsString()
@Length(1,100)
body!:string;
}