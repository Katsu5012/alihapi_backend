import {IsString,Length} from 'class-validator'
export class changePass{
    @IsString()
    @Length(8,16)
    nowPassword!:string;
    @IsString()
    @Length(8,16)
    newPassword!:string;
    @IsString()
    @Length(8,16)
    comfirmedPassword!:string;

}