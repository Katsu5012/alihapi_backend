import { IsString, Length } from "class-validator";

export class returnPost{
    @IsString()
    @Length(1,100)
    body!:string;
}