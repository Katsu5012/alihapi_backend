import { Length,IsString } from "class-validator";

export class newPass{
@IsString()
@Length(8,16)
password!:string;
@IsString()
@Length(8,16)
confirmPassword!:string
}