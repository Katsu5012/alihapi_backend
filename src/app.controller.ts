import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { PasswordOmitUser } from './users/DTO/PasswordOmitUser.dto';
import {Response} from 'express'
import {JwtPayload} from './auth/DTO/JWTPayload.dto'
@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}
  @Get()
  async hello(){
    return "hello"
  }
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() request: { user: PasswordOmitUser },@Res({ passthrough:true})response:Response){

    console.log(request.user)
    const jwt=await this.authService.login(request.user);
response.cookie("access_token",jwt,{httpOnly:true,secure:true,sameSite:"none"})
    return request.user
  }
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logOut(@Req() request: { user: JwtPayload },@Res({ passthrough: true})response: Response){
response.clearCookie("access_token",{httpOnly: true,secure: true,sameSite:"none"});
return {message: "success"}
  }
}
